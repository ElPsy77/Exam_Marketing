"use client";

import { useProgress, initialProgress } from "@/hooks/useProgress";
import { topics } from "@/data/topics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, BookOpen, Brain, CheckCircle, GraduationCap, Sparkles, Trophy } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export default function Dashboard() {
  const [progress, , isMounted] = useProgress("marketing-exam-progress", initialProgress);

  if (!isMounted) return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-48 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
      </div>
    </div>
  );

  const totalTopics = topics.length;
  const masteredCount = Object.values(progress.topicStatuses).filter(s => s === "mastered").length;
  const studyingCount = Object.values(progress.topicStatuses).filter(s => s === "studying").length;
  const masterProgress = (masteredCount / totalTopics) * 100;

  const weakTopics = topics
    .filter(t => (progress.quizScores[t.id] !== undefined && progress.quizScores[t.id] < 7))
    .slice(0, 3);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Подготовка к маркетингу</h1>
          <p className="text-base font-medium text-muted-foreground md:text-lg">Все 30 экзаменационных тем в одном учебном пространстве.</p>
        </div>
        <div className="flex w-fit items-center space-x-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold uppercase tracking-widest text-primary">Учебный режим</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <StatCard 
          title="Всего тем" 
          value={totalTopics} 
          icon={<BookOpen className="w-6 h-6 text-primary" />} 
          description="из учебной программы"
          color="bg-primary/10"
          variants={item}
        />
        <StatCard 
          title="Освоено" 
          value={masteredCount} 
          icon={<CheckCircle className="w-6 h-6 text-emerald-500" />} 
          description={`${Math.round(masterProgress)}% готовности`}
          color="bg-emerald-50"
          variants={item}
        />
        <StatCard 
          title="В процессе" 
          value={studyingCount} 
          icon={<Brain className="w-6 h-6 text-amber-500" />} 
          description="активно изучаются"
          color="bg-amber-50"
          variants={item}
        />
        <StatCard 
          title="Экзамены" 
          value={progress.completedExams} 
          icon={<Trophy className="w-6 h-6 text-purple-500" />} 
          description={`Средний балл: ${progress.averageExamScore}%`}
          color="bg-purple-50"
          variants={item}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold flex items-center justify-between">
                <span>Общий прогресс</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">
                  Level {Math.floor(masteredCount / 5) + 1}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Прогресс освоения</span>
                    <div className="text-3xl font-black text-slate-900">{Math.round(masterProgress)}%</div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-600">{masteredCount} / {totalTopics} тем</span>
                  </div>
                </div>
                <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${masterProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-indigo-400"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 border-t border-slate-50 pt-6 sm:grid-cols-3 sm:gap-6">
                <ProgressStat label="Не начато" value={totalTopics - masteredCount - studyingCount} color="bg-slate-400" />
                <ProgressStat label="Изучается" value={studyingCount} color="bg-amber-500" />
                <ProgressStat label="Освоено" value={masteredCount} color="bg-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold flex items-center space-x-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <span>Слабые темы</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {weakTopics.length > 0 ? (
                <div className="space-y-4">
                  {weakTopics.map(topic => (
                    <Link key={topic.id} href={`/study/${topic.id}`}>
                      <div className="group p-4 bg-slate-50 hover:bg-rose-50 rounded-2xl border border-transparent hover:border-rose-100 transition-all cursor-pointer">
                        <div className="text-sm font-bold truncate text-slate-800 group-hover:text-rose-700">{topic.title}</div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Тест: {progress.quizScores[topic.id]}/10</span>
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm text-rose-500 group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-6 flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    Отлично! У тебя нет слабых тем. Продолжай в том же духе!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item} className="flex justify-center pt-6">
        <Link href="/topics">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/30 transition-all sm:px-10 sm:py-5 sm:text-lg"
          >
            <GraduationCap className="w-7 h-7" />
            <span>Начать обучение</span>
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  description: string;
  color: string;
  variants: Variants;
}

function StatCard({ title, value, icon, description, color, variants }: StatCardProps) {
  return (
    <motion.div variants={variants}>
      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all overflow-hidden group">
        <CardContent className="p-5 sm:p-6 lg:p-8">
          <div className="flex items-start justify-between">
            <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300", color)}>
              {icon}
            </div>
            <div className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{value}</div>
          </div>
          <div className="mt-6 space-y-1">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</div>
            <div className="text-sm font-semibold text-slate-600">{description}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProgressStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}
