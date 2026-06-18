"use client";

import { useProgress, initialProgress } from "@/hooks/useProgress";
import { topics } from "@/data/topics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Trophy, 
  TrendingUp, 
  AlertTriangle,
  PieChart,
  BookOpen,
  Brain
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StatsPage() {
  const [progress, , isMounted] = useProgress("marketing-exam-progress", initialProgress);

  if (!isMounted) return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-48 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
      </div>
    </div>
  );

  const totalTopics = topics.length;
  const statuses = Object.values(progress.topicStatuses);
  const masteredCount = statuses.filter(s => s === "mastered").length;
  const studyingCount = statuses.filter(s => s === "studying").length;
  const newCount = totalTopics - masteredCount - studyingCount;

  const masterProgress = (masteredCount / totalTopics) * 100;
  const overallProgress = ((masteredCount + studyingCount * 0.5) / totalTopics) * 100;

  const quizEntries = Object.entries(progress.quizScores);
  const averageQuizScore = quizEntries.length > 0 
    ? quizEntries.reduce((acc, [, score]) => acc + score, 0) / quizEntries.length 
    : 0;

  const bestTopics = [...topics]
    .filter(t => progress.quizScores[t.id] !== undefined)
    .sort((a, b) => (progress.quizScores[b.id] || 0) - (progress.quizScores[a.id] || 0))
    .slice(0, 3);

  const hardestTopics = [...topics]
    .filter(t => progress.quizScores[t.id] !== undefined)
    .sort((a, b) => (progress.quizScores[a.id] || 0) - (progress.quizScores[b.id] || 0))
    .slice(0, 3);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
      className="space-y-10 pb-20"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Статистика обучения</h1>
        <p className="text-base font-medium text-slate-500 md:text-lg">Твой путь к успешному экзамену в цифрах и графиках.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Общий прогресс" 
          value={`${Math.round(overallProgress)}%`} 
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />} 
          color="bg-blue-50"
          variants={item}
        />
        <StatCard 
          title="Ср. балл тестов" 
          value={averageQuizScore.toFixed(1)} 
          icon={<BarChart3 className="w-5 h-5 text-amber-600" />} 
          color="bg-amber-50"
          variants={item}
        />
        <StatCard 
          title="Ср. балл экзамена" 
          value={`${progress.averageExamScore}%`} 
          icon={<Trophy className="w-5 h-5 text-purple-600" />} 
          color="bg-purple-50"
          variants={item}
        />
        <StatCard 
          title="Карточек изучено" 
          value={Object.keys(progress.flashcardLevels).length} 
          icon={<Brain className="w-5 h-5 text-emerald-600" />} 
          color="bg-emerald-50"
          variants={item}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white p-8">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Распределение тем
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-10">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="transparent" stroke="#f1f5f9" strokeWidth="12"
                    />
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="transparent" stroke="#10b981" strokeWidth="12"
                      strokeDasharray={`${masterProgress * 2.51} 251`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900">{Math.round(masterProgress)}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Освоено</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-6">
                  <StatusRow label="Освоено" count={masteredCount} total={totalTopics} color="bg-emerald-500" />
                  <StatusRow label="Изучается" count={studyingCount} total={totalTopics} color="bg-amber-500" />
                  <StatusRow label="Не начато" count={newCount} total={totalTopics} color="bg-slate-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white p-8">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Активность
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ActivityMetric label="Сдано экзаменов" value={progress.completedExams} />
                <ActivityMetric label="Темы в работе" value={studyingCount} />
                <ActivityMetric label="Пройдено тестов" value={quizEntries.length} />
                <ActivityMetric label="Уровень" value={Math.floor(masteredCount / 5) + 1} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="space-y-8">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <CardHeader className="bg-emerald-50/50 p-6 border-b border-emerald-100/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-700">
                <CheckCircle className="w-5 h-5" />
                Сильные темы
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {bestTopics.length > 0 ? bestTopics.map(topic => (
                <div key={topic.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-sm font-bold text-slate-700 truncate max-w-[160px]">{topic.title}</span>
                  <Badge className="bg-emerald-100 text-emerald-700 border-none font-black">{progress.quizScores[topic.id]}/10</Badge>
                </div>
              )) : <EmptyState text="Пройди хотя бы один тест" />}
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
            <CardHeader className="bg-rose-50/50 p-6 border-b border-rose-100/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                Нужно подтянуть
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {hardestTopics.length > 0 ? hardestTopics.map(topic => (
                <div key={topic.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-sm font-bold text-slate-700 truncate max-w-[160px]">{topic.title}</span>
                  <Badge className="bg-rose-100 text-rose-700 border-none font-black">{progress.quizScores[topic.id]}/10</Badge>
                </div>
              )) : <EmptyState text="Все темы освоены на отлично!" />}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, color, variants }: any) {
  return (
    <motion.div variants={variants}>
      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white p-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-xl", color)}>{icon}</div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</div>
            <div className="text-2xl font-black text-slate-900">{value}</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function StatusRow({ label, count, total, color }: any) {
  const percent = (count / total) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", color)} />
          <span className="text-sm font-bold text-slate-600">{label}</span>
        </div>
        <span className="text-xs font-black text-slate-400">{count} / {total}</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}

function ActivityMetric({ label, value }: any) {
  return (
    <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <div className="text-xl font-black text-slate-900">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1 leading-tight">{label}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-8 text-center">
      <div className="text-xs font-medium text-slate-400">{text}</div>
    </div>
  );
}
