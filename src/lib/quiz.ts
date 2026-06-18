import type { Question } from "@/data/topics";

export function getCorrectAnswer(question: Question) {
  return Array.isArray(question.correctAnswer)
    ? question.correctAnswer.join("||")
    : question.correctAnswer;
}

export function getCorrectAnswerCount(questions: Question[], answers: Record<string, string>) {
  return questions.reduce((total, question) => {
    return total + (answers[question.id] === getCorrectAnswer(question) ? 1 : 0);
  }, 0);
}

export function normalizeQuizScore(correctCount: number, totalQuestions: number) {
  if (totalQuestions === 0) return 0;

  return Math.round((correctCount / totalQuestions) * 10);
}

export function areAllQuestionsAnswered(questions: Question[], answers: Record<string, string>) {
  return questions.every((question) => Boolean(answers[question.id]));
}
