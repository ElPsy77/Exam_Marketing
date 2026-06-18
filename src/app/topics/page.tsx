"use client";

import { useProgress, initialProgress } from "@/hooks/useProgress";
import { topics } from "@/data/topics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, Sparkles, BookOpen, CheckCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TopicsPage() {
  const [progress, , isMounted] = useProgress("marketing-exam-progress", initialProgress);
  const [search, setSearch] = useState("");

  if (!isMounted) return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-48 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-slate-100 rounded-3xl" />)}
      </div>
    </div>
  );

  const normalizedSearch = search.trim().toLowerCase();
  const filteredTopics = topics.filter((topic) => {
    if (!normalizedSearch) return true;

    return [topic.title, topic.summary, topic.content]
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Все темы</h1>
          <p className="text-base font-medium text-slate-500 md:text-lg">Выбери тему, прочитай конспект и закрепи пересказом.</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            className="w-full rounded-xl border-none bg-white py-4 pl-12 pr-4 text-base font-medium shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-6"
      >
        {filteredTopics.map((topic) => {
          const status = progress.topicStatuses[topic.id] || "new";
          const score = progress.quizScores[topic.id];
          
          return (
            <motion.div variants={item} key={topic.id}>
              <Link href={`/study/${topic.id}`}>
                <Card className="group flex h-full flex-col overflow-hidden rounded-xl border-none bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                  <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        #{topic.id}
                      </div>
                      <StatusBadge status={status} />
                    </div>
                    <CardTitle className="line-clamp-2 break-words text-lg font-bold leading-snug text-slate-800 transition-colors group-hover:text-primary">
                      {topic.title}
                    </CardTitle>
                    <p className="line-clamp-3 pt-2 text-sm font-medium leading-6 text-slate-500">
                      {topic.summary}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-end p-5 pt-0 sm:p-6 sm:pt-0">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-widest font-black">
                          <span>Прогресс</span>
                          <span>{status === 'mastered' ? '100%' : status === 'studying' ? '50%' : '0%'}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: status === 'mastered' ? '100%' : status === 'studying' ? '50%' : '0%' }}
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              status === 'mastered' ? 'bg-emerald-500' : 'bg-amber-500'
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        {score !== undefined ? (
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-slate-600">Тест: <span className="text-primary">{score}/10</span></span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-slate-300">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Не начато</span>
                          </div>
                        )}
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:translate-x-1 transition-all">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function StatusBadge({ status }: { status: "new" | "studying" | "mastered" }) {
  switch (status) {
    case "mastered":
      return <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Освоено</Badge>;
    case "studying":
      return <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Изучается</Badge>;
    default:
      return <Badge className="bg-slate-100 text-slate-400 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Новое</Badge>;
  }
}
