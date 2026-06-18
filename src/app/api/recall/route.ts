import { NextResponse } from "next/server";
import { topics } from "@/data/topics";
import { evaluateRecallWithGemini } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topicId = Number(body.topicId);
    const userRecall = String(body.userRecall || "").trim();
    const topic = topics.find((item) => item.id === topicId);

    if (!topic) {
      return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
    }

    if (userRecall.length < 20) {
      return NextResponse.json({ error: "Напишите более подробный пересказ" }, { status: 400 });
    }

    const feedback = await evaluateRecallWithGemini(topic.title, topic.content, userRecall);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Recall API Error:", error);

    return NextResponse.json(
      { error: "ИИ-анализ временно недоступен. Проверьте Gemini API key в переменных окружения." },
      { status: 500 }
    );
  }
}
