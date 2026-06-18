"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import confetti from "canvas-confetti";
import { topics } from "@/data/topics";
import { useProgress, initialProgress } from "@/hooks/useProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/study/StatusBadge";
import { StudyContent } from "@/components/study/StudyContent";
import { RecallTrainer } from "@/components/study/RecallTrainer";
import { TopicQuiz } from "@/components/study/TopicQuiz";

export default function StudyPage() {
  const { id } = useParams();
  const router = useRouter();
  const topicId = Number(id);
  const topic = topics.find((item) => item.id === topicId);
  const [progress, setProgress, isMounted] = useProgress("marketing-exam-progress", initialProgress);

  if (!isMounted) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-64 rounded-lg bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-400">Тема не найдена</h1>
        <Button onClick={() => router.push("/topics")} className="mt-4">Вернуться к списку</Button>
      </div>
    );
  }

  const updateTopicStatus = (score: number) => {
    if (score >= 8) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#ec4899"],
      });
    }

    setProgress((current) => ({
      ...current,
      topicStatuses: {
        ...current.topicStatuses,
        [topicId]: score >= 8 ? "mastered" : "studying",
      },
    }));
  };

  const completeQuiz = (score: number) => {
    updateTopicStatus(score);
    setProgress((current) => ({
      ...current,
      quizScores: {
        ...current.quizScores,
        [topicId]: score,
      },
      topicStatuses: {
        ...current.topicStatuses,
        [topicId]: score >= 8 ? "mastered" : "studying",
      },
    }));
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);

    const correctCount = topic.quizQuestions.reduce((total, question) => {
      const selectedAnswer = quizAnswers[question.id];
      const correctAnswer = Array.isArray(question.correctAnswer)
        ? question.correctAnswer.join("||")
        : question.correctAnswer;

      return total + (selectedAnswer === correctAnswer ? 1 : 0);
    }, 0);
    const normalizedScore = Math.round((correctCount / topic.quizQuestions.length) * 10);

    setProgress(prev => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [topicId]: normalizedScore
      },
      topicStatuses: {
        ...prev.topicStatuses,
        [topicId]: normalizedScore >= 8 ? "mastered" : "studying"
      }
    }));

    if (normalizedScore >= 8) {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.7 },
        colors: ['#10b981', '#6366f1', '#f59e0b']
      });
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const correctQuizCount = topic.quizQuestions.reduce((total, question) => {
    const correctAnswer = Array.isArray(question.correctAnswer)
      ? question.correctAnswer.join("||")
      : question.correctAnswer;

    return total + (quizAnswers[question.id] === correctAnswer ? 1 : 0);
  }, 0);
  const allQuizAnswered = topic.quizQuestions.every(question => quizAnswers[question.id]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10 md:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={() => router.push("/topics")} className="rounded-xl px-2 hover:bg-slate-100">
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span className="font-bold text-slate-600">Ко всем темам</span>
        </Button>
        <StatusBadge status={progress.topicStatuses[topicId] || "new"} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-primary">
          <BookOpen className="h-4 w-4" />
          <span>Тема #{topic.id}</span>
        </div>
        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">{topic.title}</h1>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="mb-6 grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100/70 p-1 md:mb-10 md:h-14 md:p-1.5">
          <TabsTrigger value="content" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Изучение</TabsTrigger>
          <TabsTrigger value="recall" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Пересказ</TabsTrigger>
          <TabsTrigger value="quiz" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Тест</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
          <StudyContent topic={topic} />
        </TabsContent>

        <TabsContent value="recall" className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
          <RecallTrainer topicId={topic.id} onComplete={updateTopicStatus} />
        </TabsContent>

        <TabsContent value="quiz" className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
          <TopicQuiz questions={topic.quizQuestions} savedScore={progress.quizScores[topicId]} onComplete={completeQuiz} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
