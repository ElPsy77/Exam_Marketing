"use client";

import { useProgress, initialProgress } from "@/hooks/useProgress";
import { topics } from "@/data/topics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export default function FlashcardsPage() {
  const [, setProgress, isMounted] = useProgress("marketing-exam-progress", initialProgress);
  const allFlashcards = topics.flatMap(t => t.flashcards);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  if (!isMounted) return null;

  const currentCard = allFlashcards[currentIndex];

  const handleNext = () => {
    setDirection(1);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % allFlashcards.length);
    }, 200);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + allFlashcards.length) % allFlashcards.length);
    }, 200);
  };

  const handleDifficulty = (level: "easy" | "medium" | "hard") => {
    setProgress(prev => ({
      ...prev,
      flashcardLevels: {
        ...prev.flashcardLevels,
        [currentCard.id]: level
      }
    }));
    handleNext();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 md:space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Карточки для запоминания</h1>
        <p className="text-slate-500 mt-2">Карточка {currentIndex + 1} из {allFlashcards.length}</p>
      </div>

      <div className="perspective-1000 relative min-h-[360px] md:min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex + (isFlipped ? "-flipped" : "")}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 50 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 w-full cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <Card className={`flex min-h-[360px] w-full items-center justify-center overflow-y-auto rounded-xl border-2 p-5 text-center shadow-xl transition-colors md:min-h-[420px] md:p-8 ${isFlipped ? 'bg-blue-600 border-blue-700' : 'bg-white border-slate-100'}`}>
              <CardContent className="p-0">
                <p className={`text-lg font-medium leading-relaxed md:text-2xl ${isFlipped ? 'text-white' : 'text-slate-800'}`}>
                  {isFlipped ? currentCard.answer : currentCard.question}
                </p>
                {!isFlipped && (
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center whitespace-nowrap text-sm text-slate-400">
                    <RotateCcw className="w-4 h-4 mr-2" /> Нажми, чтобы перевернуть
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center space-y-6">
        {isFlipped ? (
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <Button variant="outline" className="h-12 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => handleDifficulty("hard")}>Сложно</Button>
            <Button variant="outline" className="h-12 border-amber-200 text-amber-600 hover:bg-amber-50" onClick={() => handleDifficulty("medium")}>Средне</Button>
            <Button variant="outline" className="h-12 border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => handleDifficulty("easy")}>Легко</Button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handlePrev}>
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext}>
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-4 rounded-xl text-center text-xs text-slate-400">
        Используй карточки для быстрого повторения ключевых определений.
      </div>
    </div>
  );
}
