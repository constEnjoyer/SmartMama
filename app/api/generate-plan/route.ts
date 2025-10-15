import { type NextRequest, NextResponse } from "next/server"
import type { PlanResponse } from "@/lib/types"

const SYSTEM_PROMPT = `Ты — профессиональный медицинско-педагогический ассистент для беременных и родителей детей 0–36 месяцев. Отвечай как эксперт на основе доказательной медицины и общих руководств, но не ставь диагнозы. Формат ответа — строгий JSON:
{
  "summary": "короткое резюме на русском",
  "weeklyPlan": [{"period":"строка","goals":[],"activities":[],"tips":[]}],
  "checklists":[{"title":"...","items":[{"text":"...","done":false}]}],
  "warnings":["..."]
}
Пиши на русском. Если данных мало — запрашивай уточнение.`

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBydljjLk12w59IdJ-AZJCO02PYGOGPlNI"

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API ключ не настроен на сервере" }, { status: 500 })
    }

    const body = await request.json()
    const { mode, period, goals } = body

    if (!mode || !period) {
      return NextResponse.json({ error: "Не указаны обязательные параметры" }, { status: 400 })
    }

    const userPrompt = `Режим: ${mode === "pregnancy" ? "беременность" : "ребёнок 0-36 мес"}. Срок: ${period} ${mode === "pregnancy" ? "недель" : "месяцев"}. Цели: ${goals || "Общее развитие и здоровье"}. Сгенерируй JSON по схеме выше. Если режим=pregnancy — минимум 4 блока по неделям. Если режим=child — минимум 4 блока по месяцам. Пиши на русском.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\n${userPrompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error?.message || `Gemini API ошибка: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      return NextResponse.json({ error: "Пустой ответ от Gemini API" }, { status: 500 })
    }

    // Try to parse JSON from the response
    let parsedData: PlanResponse
    try {
      parsedData = JSON.parse(content)
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1])
      } else {
        // Try to find JSON object in the text
        const objectMatch = content.match(/\{[\s\S]*\}/)
        if (objectMatch) {
          parsedData = JSON.parse(objectMatch[0])
        } else {
          return NextResponse.json({ error: "Не удалось распарсить JSON из ответа" }, { status: 500 })
        }
      }
    }

    // Validate the structure
    if (!parsedData.summary || !parsedData.weeklyPlan || !Array.isArray(parsedData.weeklyPlan)) {
      return NextResponse.json({ error: "Неверная структура ответа от API" }, { status: 500 })
    }

    return NextResponse.json(parsedData)
  } catch (error) {
    console.error("[v0] Error in generate-plan API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Неизвестная ошибка" }, { status: 500 })
  }
}
