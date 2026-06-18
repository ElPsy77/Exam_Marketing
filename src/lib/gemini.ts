import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface RecallFeedback {
  score: number;
  missingPoints: string[];
  strengths: string[];
  recommendations: string;
}

export async function evaluateRecall(
  topicTitle: string,
  originalContent: string,
  userRecall: string
): Promise<RecallFeedback> {
  const prompt = `
    Ты эксперт по маркетингу и преподаватель. 
    Тема: "${topicTitle}"
    Оригинальный материал:
    "${originalContent.substring(0, 3000)}"

    Студент написал свой пересказ этой темы:
    "${userRecall}"

    Оцени ответ студента. 
    Верни ответ СТРОГО в формате JSON:
    {
      "score": (число от 1 до 10),
      "missingPoints": ["что упущено 1", "что упущено 2"],
      "strengths": ["сильные стороны 1", "сильные стороны 2"],
      "recommendations": "текст рекомендации"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Clean up potential markdown code blocks
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      score: 5,
      missingPoints: ["Не удалось получить детальный анализ"],
      strengths: ["Попытка пересказа"],
      recommendations: "Попробуйте еще раз или проверьте интернет-соединение."
    };
  }
}
