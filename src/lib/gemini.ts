import { GoogleGenerativeAI } from "@google/generative-ai";
import type { RecallFeedback } from "@/types/study";

const GEMINI_MODEL = "gemini-1.5-flash";

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
}

function buildRecallPrompt(topicTitle: string, originalContent: string, userRecall: string) {
  return `
Ты эксперт по маркетингу и преподаватель.
Тема: "${topicTitle}"
Оригинальный материал:
"${originalContent.substring(0, 3000)}"

Студент написал свой пересказ этой темы:
"${userRecall}"

Оцени ответ студента.
Верни ответ СТРОГО в формате JSON без markdown:
{
  "score": (число от 1 до 10),
  "missingPoints": ["что упущено 1", "что упущено 2"],
  "strengths": ["сильные стороны 1", "сильные стороны 2"],
  "recommendations": "текст рекомендации"
}
`;
}

function parseRecallFeedback(text: string): RecallFeedback {
  const json = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(json) as Partial<RecallFeedback>;

  return {
    score: Math.min(10, Math.max(1, Number(parsed.score) || 1)),
    missingPoints: Array.isArray(parsed.missingPoints) ? parsed.missingPoints.map(String) : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
    recommendations: String(parsed.recommendations || "Повтори материал и попробуй пересказать тему еще раз."),
  };
}

export async function evaluateRecallWithGemini(
  topicTitle: string,
  originalContent: string,
  userRecall: string
): Promise<RecallFeedback> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent(buildRecallPrompt(topicTitle, originalContent, userRecall));
  const response = await result.response;

  return parseRecallFeedback(response.text());
}

export async function requestRecallFeedback(topicId: number, userRecall: string): Promise<RecallFeedback> {
  const response = await fetch("/api/recall", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topicId, userRecall }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Не удалось получить анализ пересказа");
  }

  return payload.feedback as RecallFeedback;
}
