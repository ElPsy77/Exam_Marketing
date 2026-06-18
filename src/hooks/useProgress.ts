"use client";

import { useState, useEffect, useCallback } from "react";

export function useProgress<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  return [storedValue, setValue, isMounted] as const;
}

export type TopicStatus = "new" | "studying" | "mastered";

export interface UserProgress {
  topicStatuses: Record<number, TopicStatus>;
  quizScores: Record<number, number>;
  flashcardLevels: Record<string, "easy" | "medium" | "hard">;
  completedExams: number;
  averageExamScore: number;
}

export const initialProgress: UserProgress = {
  topicStatuses: {},
  quizScores: {},
  flashcardLevels: {},
  completedExams: 0,
  averageExamScore: 0,
};
