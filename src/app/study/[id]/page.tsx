"use client";

import { useParams, useRouter } from "next/navigation";
import { topics } from "@/data/topics";
import { useProgress, initialProgress } from "@/hooks/useProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowLeft, BookOpen, Brain, CheckCircle, Lightbulb, MessageSquare, Sparkles } from "lucide-react";
import { useState } from "react";
import { evaluateRecall, RecallFeedback } from "@/lib/gemini";
import { Textarea } from "@/components/ui/textarea";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StudyPage() {
  const { id } = useParams();
  const router = useRouter();
  const topicId = parseInt(id as string);
  const topic = topics.find(t => t.id === topicId);
  const [progress, setProgress, isMounted] = useProgress("marketing-exam-progress", initialProgress);
  
  const [recallText, setRecallText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<RecallFeedback | null>(null);

  if (!isMounted) return <div className="animate-pulse space-y-8">
    <div className="h-10 w-64 bg-slate-200 rounded-lg" />
    <div className="h-64 bg-slate-100 rounded-2xl" />
  </div>;
  
  if (!topic) return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold text-slate-400">Тема не найдена</h1>
      <Button onClick={() => router.push("/topics")} className="mt-4">Вернуться к списку</Button>
    </div>
  );

  const handleRecallSubmit = async () => {
    if (!recallText.trim()) return;
    
    setIsEvaluating(true);
    const result = await evaluateRecall(topic.title, topic.content, recallText);
    setFeedback(result);
    setIsEvaluating(false);

    if (result.score >= 8) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });
      
      setProgress(prev => ({
        ...prev,
        topicStatuses: {
          ...prev.topicStatuses,
          [topicId]: "mastered"
        }
      }));
    } else if (progress.topicStatuses[topicId] !== "mastered") {
      setProgress(prev => ({
        ...prev,
        topicStatuses: {
          ...prev.topicStatuses,
          [topicId]: "studying"
        }
      }));
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10 md:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={() => router.push("/topics")} className="hover:bg-slate-100 rounded-xl px-2">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-bold text-slate-600">Ко всем темам</span>
        </Button>
        <StatusBadge status={progress.topicStatuses[topicId] || "new"} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 text-primary font-bold uppercase tracking-widest text-xs">
          <BookOpen className="w-4 h-4" />
          <span>Тема #{topic.id}</span>
        </div>
        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-4xl">
          {topic.title}
        </h1>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="mb-6 grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100/70 p-1 md:mb-10 md:h-14 md:p-1.5">
          <TabsTrigger value="content" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Изучение
          </TabsTrigger>
          <TabsTrigger value="recall" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Пересказ
          </TabsTrigger>
          <TabsTrigger value="quiz" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Тест
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full" />
                  <span>Полный материал</span>
                </h3>
                <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-5 text-slate-700 shadow-sm sm:p-6 md:p-8">
                  {topic.blocks.map((block, index) => (
                    <ContentBlockView key={`${block.type}-${index}`} type={block.type} text={block.text} />
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
              <Card className="rounded-xl border-none bg-primary/5 p-5 shadow-sm sm:p-6">
                <div className="flex items-center space-x-2 text-primary font-bold text-sm mb-4">
                  <Lightbulb className="w-4 h-4" />
                  <span>Суть вкратце</span>
                </div>
                <p className="font-medium leading-relaxed text-slate-700">
                  {topic.summary}
                </p>
              </Card>

              <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 px-2">Основные тезисы</h3>
                <div className="space-y-3">
                  {topic.keyPoints.map((point, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="group flex items-start space-x-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors break-words overflow-hidden">
                        {point}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="recall" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative overflow-hidden rounded-xl bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-200 md:p-8">
            <Sparkles className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
            <h3 className="text-2xl font-black flex items-center mb-3">
              <Brain className="w-8 h-8 mr-3" /> Active Recall AI
            </h3>
            <p className="text-indigo-100 font-medium leading-relaxed max-w-xl">
              Напиши всё, что помнишь по этой теме. Наш AI проанализирует твой ответ, сравнит его с лекцией и укажет на пробелы.
            </p>
          </div>

          <div className="relative">
            <Textarea 
              placeholder="Начни писать свой пересказ здесь..." 
              className="min-h-[320px] resize-none rounded-xl border-none bg-white p-5 text-base shadow-2xl shadow-slate-200/50 focus-visible:ring-2 focus-visible:ring-primary/20 sm:p-6 md:min-h-[400px] md:text-lg"
              value={recallText}
              onChange={(e) => setRecallText(e.target.value)}
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
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Анализ...
                  </>
                ) : "Проверить пересказ"}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-4"
              >
                <Card className={cn(
                  "border-none rounded-[3rem] overflow-hidden shadow-2xl transition-all",
                  feedback.score >= 8 ? 'bg-emerald-50' : feedback.score >= 5 ? 'bg-amber-50' : 'bg-rose-50'
                )}>
                  <div className="p-10 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-3xl font-black text-slate-900">Результат анализа</h4>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Обработка завершена</p>
                      </div>
                      <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-900 leading-none">{feedback.score}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase mt-1">из 10</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white/50 p-6 rounded-[2rem] space-y-4">
                        <h5 className="font-bold text-emerald-700 flex items-center uppercase tracking-widest text-xs">
                          <CheckCircle className="w-4 h-4 mr-2" /> Сильные стороны
                        </h5>
                        <ul className="space-y-2 text-sm font-semibold text-slate-600">
                          {feedback.strengths.map((s, i) => <li key={i} className="flex items-start"><span className="mr-2 text-emerald-500">•</span> {s}</li>)}
                        </ul>
                      </div>
                      <div className="bg-white/50 p-6 rounded-[2rem] space-y-4">
                        <h5 className="font-bold text-amber-700 flex items-center uppercase tracking-widest text-xs">
                          <AlertCircle className="w-4 h-4 mr-2" /> Что упущено
                        </h5>
                        <ul className="space-y-2 text-sm font-semibold text-slate-600">
                          {feedback.missingPoints.map((m, i) => <li key={i} className="flex items-start"><span className="mr-2 text-amber-500">•</span> {m}</li>)}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm">
                      <h5 className="font-bold text-slate-800 flex items-center mb-3 uppercase tracking-widest text-xs">
                        <MessageSquare className="w-4 h-4 mr-2 text-primary" /> Рекомендация преподавателя
                      </h5>
                      <p className="text-base text-slate-600 leading-relaxed font-medium">
                        {feedback.recommendations}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="quiz">
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-100/50 py-20 text-center md:py-32">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-xl bg-white shadow-sm">
              <CheckCircle className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-500 mb-2">Тест скоро появится</h3>
            <p className="text-slate-400 font-medium">Мы готовим лучшие вопросы для этой темы.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContentBlockView({ type, text }: { type: "heading" | "subheading" | "paragraph" | "list"; text: string }) {
  if (type === "heading") {
    return <h2 className="pt-4 text-xl font-black leading-snug text-slate-900 first:pt-0">{text}</h2>;
  }

  if (type === "subheading") {
    return <h3 className="pt-2 text-base font-bold leading-snug text-primary">{text}</h3>;
  }

  if (type === "list") {
    return (
      <div className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium leading-relaxed text-slate-700 sm:text-base">
        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        <span>{text}</span>
      </div>
    );
  }

  return <p className="whitespace-pre-line text-base leading-8 text-slate-700 sm:text-lg">{text}</p>;
}

function StatusBadge({ status }: { status: "new" | "studying" | "mastered" }) {
  switch (status) {
    case "mastered":
      return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-4 py-1.5 rounded-full font-bold">Освоено</Badge>;
    case "studying":
      return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none px-4 py-1.5 rounded-full font-bold">Изучается</Badge>;
    default:
      return <Badge className="bg-slate-200 text-slate-500 border-none px-4 py-1.5 rounded-full font-bold">Не изучено</Badge>;
  }
}
