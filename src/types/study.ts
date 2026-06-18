import type { ContentBlock, Question, Topic } from "@/data/topics";

export type TopicStatus = "new" | "studying" | "mastered";

export interface RecallFeedback {
  score: number;
  missingPoints: string[];
  strengths: string[];
  recommendations: string;
}

export interface TopicSectionProps {
  topic: Topic;
}

export interface ContentBlockViewProps {
  type: ContentBlock["type"];
  text: string;
}

export interface TopicQuizProps {
  questions: Question[];
  savedScore?: number;
  onComplete: (score: number) => void;
}
