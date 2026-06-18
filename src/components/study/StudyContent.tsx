import { Card } from "@/components/ui/card";
import { ContentBlockView } from "@/components/study/ContentBlockView";
import type { TopicSectionProps } from "@/types/study";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export function StudyContent({ topic }: TopicSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
      <section className="space-y-4">
        <h3 className="flex items-center space-x-2 text-xl font-bold text-slate-900">
          <span className="h-6 w-1.5 rounded-full bg-primary" />
          <span>Полный материал</span>
        </h3>
        <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-5 text-slate-700 shadow-sm sm:p-6 md:p-8">
          {topic.blocks.map((block, index) => (
            <ContentBlockView key={`${block.type}-${index}`} type={block.type} text={block.text} />
          ))}
        </div>
      </section>

      <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
        <Card className="rounded-xl border-none bg-primary/5 p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center space-x-2 text-sm font-bold text-primary">
            <Lightbulb className="h-4 w-4" />
            <span>Суть вкратце</span>
          </div>
          <p className="font-medium leading-relaxed text-slate-700">{topic.summary}</p>
        </Card>

        <section className="space-y-4">
          <h3 className="px-2 text-lg font-bold text-slate-900">Основные тезисы</h3>
          <div className="space-y-3">
            {topic.keyPoints.map((point, index) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={point}
                className="group flex items-start space-x-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-500 transition-colors group-hover:bg-primary group-hover:text-white">
                  {index + 1}
                </div>
                <span className="overflow-hidden break-words text-sm font-semibold text-slate-600 transition-colors group-hover:text-slate-900">
                  {point}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
