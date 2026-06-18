"use client";

import { useProgress, initialProgress } from "@/hooks/useProgress";
import { topics, Question } from "@/data/topics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useCallback } from "react";
import { Timer, AlertCircle, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

export default function ExamPage() {
  const [, setProgress, isMounted] = useProgress("marketing-exam-progress", initialProgress);
  const [examState, setExamState] = useState<"setup" | "active" | "result">("setup");
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  const finishExam = useCallback(() => {
    const score = examQuestions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correctAnswer ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / examQuestions.length) * 100);

    setProgress(prev => ({
      ...prev,
      completedExams: prev.completedExams + 1,
      averageExamScore: Math.round((prev.averageExamScore * prev.completedExams + percentage) / (prev.completedExams + 1))
    }));

    if (percentage >= 80) {
      confetti({ particleCount: 150, spread: 100 });
    }
    setExamState("result");
  }, [examQuestions, answers, setProgress]);

  const startExam = (count: number) => {
    const allQuestions = topics.flatMap(t => t.quizQuestions);
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    setExamQuestions(shuffled.slice(0, count));
    setTimeLeft(count * 60); // 1 minute per question
    setExamState("active");
    setCurrentIdx(0);
    setAnswers({});
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examState === "active" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && examState === "active") {
      finishExam();
    }
    return () => clearInterval(timer);
  }, [examState, timeLeft, finishExam]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isMounted) return null;

  if (examState === "setup") {
    return (
      <div className="mx-auto max-w-2xl space-y-8 py-6 md:py-12">
        <div className="text-center space-y-4">
          <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Симулятор экзамена</h1>
          <p className="text-slate-500">Проверь свои знания в условиях, приближенных к реальному экзамену.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <ExamOption title="Мини-тест" questions={20} time="20 минут" onStart={() => startExam(20)} />
          <ExamOption title="Полный экзамен" questions={30} time="30 минут" onStart={() => startExam(30)} />
        </div>

        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className="text-sm text-amber-800 leading-relaxed">
              <strong>Внимание:</strong> После начала экзамена запустится таймер. Если вы не успеете ответить на все вопросы, экзамен завершится автоматически.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (examState === "active") {
    const q = examQuestions[currentIdx];
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="sticky top-[65px] z-10 flex flex-col gap-3 border-b bg-slate-50/95 py-4 backdrop-blur md:top-0 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Вопрос {currentIdx + 1} из {examQuestions.length}</div>
            <Progress value={(currentIdx / examQuestions.length) * 100} className="h-2 w-full md:w-48" />
          </div>
          <div className={`flex w-fit items-center space-x-2 rounded-full px-4 py-2 font-mono text-lg font-bold ${timeLeft < 60 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-white text-slate-600'}`}>
            <Timer className="w-5 h-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <Card className="rounded-xl border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed md:text-xl">{q.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {q.options?.map((option: string) => (
              <button
                key={option}
                onClick={() => setAnswers({ ...answers, [q.id]: option })}
                className={`w-full rounded-xl border-2 p-4 text-left text-sm leading-relaxed transition-all md:text-base ${
                  answers[q.id] === option 
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' 
                  : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                {option}
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} disabled={currentIdx === 0}>Назад</Button>
          {currentIdx === examQuestions.length - 1 ? (
            <Button onClick={finishExam} size="lg" className="bg-emerald-600 hover:bg-emerald-700">Завершить экзамен</Button>
          ) : (
            <Button onClick={() => setCurrentIdx(prev => prev + 1)} size="lg">Далее</Button>
          )}
        </div>
      </div>
    );
  }

  const finalScore = examQuestions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0);
  const percent = Math.round((finalScore / examQuestions.length) * 100);

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6 text-center md:py-12">
      <div className="space-y-4">
        <div className="text-5xl font-black md:text-7xl">{percent}%</div>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Экзамен завершен!</h2>
        <p className="text-slate-500">Вы ответили правильно на {finalScore} из {examQuestions.length} вопросов.</p>
      </div>

      <Card>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="text-sm text-slate-500">Правильно</div>
              <div className="text-2xl font-bold text-emerald-600">{finalScore}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="text-sm text-slate-500">Ошибок</div>
              <div className="text-2xl font-bold text-rose-600">{examQuestions.length - finalScore}</div>
            </div>
          </div>
          
          <Button className="w-full h-12 text-lg font-bold" onClick={() => setExamState("setup")}>Попробовать еще раз</Button>
          <Button variant="ghost" className="w-full" onClick={() => window.location.href = "/"}>Вернуться на главную</Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface ExamOptionProps {
  title: string;
  questions: number;
  time: string;
  onStart: () => void;
}

function ExamOption({ title, questions, time, onStart }: ExamOptionProps) {
  return (
    <Card className="hover:border-blue-200 transition-colors">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-slate-500">
          <div className="flex justify-between"><span>Вопросов:</span> <strong>{questions}</strong></div>
          <div className="flex justify-between"><span>Время:</span> <strong>{time}</strong></div>
        </div>
        <Button className="w-full font-bold" onClick={onStart}>Начать</Button>
      </CardContent>
    </Card>
  );
}
