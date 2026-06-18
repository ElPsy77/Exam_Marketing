"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle, RotateCcw, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { areAllQuestionsAnswered, getCorrectAnswer, getCorrectAnswerCount, normalizeQuizScore } from "@/lib/quiz";
import type { TopicQuizProps } from "@/types/study";

export function TopicQuiz({ questions, savedScore, onComplete }: TopicQuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const correctCount = useMemo(() => getCorrectAnswerCount(questions, answers), [questions, answers]);
  const score = normalizeQuizScore(correctCount, questions.length);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = areAllQuestionsAnswered(questions, answers);

  const submitQuiz = () => {
    setSubmitted(true);
    onComplete(score);
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-5">
        {questions.map((question, questionIndex) => (
          <QuizQuestionCard
            key={question.id}
            questionIndex={questionIndex}
            question={question}
            selectedAnswer={answers[question.id]}
            submitted={submitted}
            onSelect={(option) => setAnswers((current) => ({ ...current, [question.id]: option }))}
          />
        ))}
      </div>

      <QuizSummary
        answeredCount={answeredCount}
        totalCount={questions.length}
        correctCount={correctCount}
        score={score}
        savedScore={savedScore}
        submitted={submitted}
        allAnswered={allAnswered}
        onSubmit={submitQuiz}
        onReset={resetQuiz}
      />
    </div>
  );
}

interface QuizQuestionCardProps {
  questionIndex: number;
  question: TopicQuizProps["questions"][number];
  selectedAnswer?: string;
  submitted: boolean;
  onSelect: (option: string) => void;
}

function QuizQuestionCard({ questionIndex, question, selectedAnswer, submitted, onSelect }: QuizQuestionCardProps) {
  const correctAnswer = getCorrectAnswer(question);
  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <Card className="overflow-hidden rounded-xl border-none bg-white shadow-sm">
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-black text-primary">
            {questionIndex + 1}
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-black leading-relaxed text-slate-900 sm:text-lg">{question.question}</h3>
            <Badge variant="secondary" className="rounded-full border-none bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Один вариант ответа
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          {question.options?.map((option) => {
            const isSelected = selectedAnswer === option;
            const isRightOption = option === correctAnswer;

            return (
              <button
                key={option}
                type="button"
                disabled={submitted}
                onClick={() => onSelect(option)}
                className={cn(
                  "w-full rounded-xl border-2 p-4 text-left text-sm font-semibold leading-relaxed transition-all sm:text-base",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-default",
                  !submitted && isSelected && "border-primary bg-primary/5 text-primary",
                  !submitted && !isSelected && "border-slate-100 bg-white text-slate-600 hover:border-primary/30 hover:bg-slate-50",
                  submitted && isRightOption && "border-emerald-500 bg-emerald-50 text-emerald-700",
                  submitted && isSelected && !isRightOption && "border-rose-500 bg-rose-50 text-rose-700",
                  submitted && !isSelected && !isRightOption && "border-slate-100 bg-slate-50 text-slate-400"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div className={cn("rounded-xl p-4 text-sm font-medium leading-relaxed", isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>
            <div className="mb-1 flex items-center gap-2 font-black">
              {isCorrect ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {isCorrect ? "Верно" : "Нужно повторить"}
            </div>
            {question.explanation}
          </div>
        )}
      </div>
    </Card>
  );
}

function QuizSummary({ answeredCount, totalCount, correctCount, score, savedScore, submitted, allAnswered, onSubmit, onReset }: {
  answeredCount: number;
  totalCount: number;
  correctCount: number;
  score: number;
  savedScore?: number;
  submitted: boolean;
  allAnswered: boolean;
  onSubmit: () => void;
  onReset: () => void;
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
      <Card className="rounded-xl border-none bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-widest text-slate-400">Тренировка</div>
            <div className="text-lg font-black text-slate-900">{submitted ? `${correctCount}/${totalCount}` : `${answeredCount}/${totalCount}`}</div>
          </div>
        </div>

        {savedScore !== undefined && !submitted && (
          <div className="mb-3 rounded-xl bg-primary/5 p-3 text-center text-xs font-bold text-primary">Последний результат: {savedScore}/10</div>
        )}

        {submitted ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <div className="text-4xl font-black text-slate-900">{score}/10</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">Итоговый балл</div>
            </div>
            <Button variant="outline" className="h-12 w-full rounded-xl font-bold" onClick={onReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Пройти заново
            </Button>
          </div>
        ) : (
          <Button className="h-12 w-full rounded-xl font-black" onClick={onSubmit} disabled={!allAnswered}>
            Завершить тест
          </Button>
        )}

        {!allAnswered && !submitted && (
          <p className="mt-3 text-center text-xs font-medium text-slate-400">Ответь на все вопросы, чтобы сохранить результат.</p>
        )}
      </Card>
    </aside>
  );
}
