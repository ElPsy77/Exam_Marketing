"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Brain, CheckCircle, MessageSquare, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { requestRecallFeedback } from "@/lib/gemini";
import type { RecallFeedback } from "@/types/study";

interface RecallTrainerProps {
  topicId: number;
  onComplete: (score: number) => void;
}

const fallbackFeedback: RecallFeedback = {
  score: 5,
  missingPoints: ["ИИ-анализ временно недоступен"],
  strengths: ["Пересказ сохранен в текущей попытке"],
  recommendations: "Проверьте Gemini API key в Vercel и попробуйте еще раз.",
};

export function RecallTrainer({ topicId, onComplete }: RecallTrainerProps) {
  const [recallText, setRecallText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<RecallFeedback | null>(null);

  const handleRecallSubmit = async () => {
    if (!recallText.trim()) return;

    setIsEvaluating(true);

    try {
      const result = await requestRecallFeedback(topicId, recallText);
      setFeedback(result);
      onComplete(result.score);
    } catch (error) {
      console.error("Recall feedback error:", error);
      setFeedback(fallbackFeedback);
      onComplete(fallbackFeedback.score);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-xl bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-200 md:p-8">
        <Sparkles className="absolute -right-4 -top-4 h-32 w-32 rotate-12 opacity-10" />
        <h3 className="mb-3 flex items-center text-2xl font-black">
          <Brain className="mr-3 h-8 w-8" /> Active Recall AI
        </h3>
        <p className="max-w-xl font-medium leading-relaxed text-indigo-100">
          Напиши всё, что помнишь по этой теме. AI проанализирует ответ, сравнит его с лекцией и укажет на пробелы.
        </p>
      </div>

      <div className="relative">
        <Textarea
          placeholder="Начни писать свой пересказ здесь..."
          className="min-h-[320px] resize-none rounded-xl border-none bg-white p-5 text-base shadow-2xl shadow-slate-200/50 focus-visible:ring-2 focus-visible:ring-primary/20 sm:p-6 md:min-h-[400px] md:text-lg"
          value={recallText}
          onChange={(event) => setRecallText(event.target.value)}
          disabled={isEvaluating}
        />
        <div className="mt-4 flex justify-end sm:absolute sm:bottom-6 sm:right-6 sm:mt-0">
          <Button
            size="lg"
            onClick={handleRecallSubmit}
            disabled={isEvaluating || !recallText.trim()}
            className="h-12 w-full rounded-xl px-6 font-black shadow-lg shadow-primary/20 sm:w-auto md:h-14 md:px-10 md:text-lg"
          >
            {isEvaluating ? (
              <>
                <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Анализ...
              </>
            ) : "Проверить пересказ"}
          </Button>
        </div>
      </div>

      <AnimatePresence>{feedback && <RecallFeedbackCard feedback={feedback} />}</AnimatePresence>
    </div>
  );
}

function RecallFeedbackCard({ feedback }: { feedback: RecallFeedback }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pt-4">
      <Card className={cn(
        "overflow-hidden rounded-[3rem] border-none shadow-2xl transition-all",
        feedback.score >= 8 ? "bg-emerald-50" : feedback.score >= 5 ? "bg-amber-50" : "bg-rose-50"
      )}>
        <div className="space-y-8 p-6 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h4 className="text-3xl font-black text-slate-900">Результат анализа</h4>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Обработка завершена</p>
            </div>
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-3xl bg-white shadow-sm">
              <span className="text-4xl font-black leading-none text-slate-900">{feedback.score}</span>
              <span className="mt-1 text-[10px] font-black uppercase text-slate-400">из 10</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <FeedbackList title="Сильные стороны" icon={<CheckCircle className="mr-2 h-4 w-4" />} items={feedback.strengths} tone="emerald" />
            <FeedbackList title="Что упущено" icon={<AlertCircle className="mr-2 h-4 w-4" />} items={feedback.missingPoints} tone="amber" />
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
            <h5 className="mb-3 flex items-center text-xs font-bold uppercase tracking-widest text-slate-800">
              <MessageSquare className="mr-2 h-4 w-4 text-primary" /> Рекомендация преподавателя
            </h5>
            <p className="text-base font-medium leading-relaxed text-slate-600">{feedback.recommendations}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function FeedbackList({ title, icon, items, tone }: { title: string; icon: ReactNode; items: string[]; tone: "emerald" | "amber" }) {
  const toneClass = tone === "emerald" ? "text-emerald-700" : "text-amber-700";
  const bulletClass = tone === "emerald" ? "text-emerald-500" : "text-amber-500";

  return (
    <div className="space-y-4 rounded-[2rem] bg-white/50 p-6">
      <h5 className={cn("flex items-center text-xs font-bold uppercase tracking-widest", toneClass)}>{icon} {title}</h5>
      <ul className="space-y-2 text-sm font-semibold text-slate-600">
        {items.map((item) => <li key={item} className="flex items-start"><span className={cn("mr-2", bulletClass)}>•</span>{item}</li>)}
      </ul>
    </div>
  );
}
