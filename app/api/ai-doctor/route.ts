import { type NextRequest, NextResponse } from "next/server"

interface Message {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, history, planData, mode, period } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Сообщение обязательно" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBydljjLk12w59IdJ-AZJCO02PYGOGPlNI"

    // Build conversation history for context
    const conversationHistory = (history || [])
      .map((msg: Message) => `${msg.role === "user" ? "Пациент" : "Врач"}: ${msg.content}`)
      .join("\n\n")

    let planContext = ""
    if (planData && planData.weeklyPlan) {
      const planType = mode === "pregnancy" ? "беременности" : "развития ребёнка"
      const periodText = period ? ` (текущий период: ${period} ${mode === "pregnancy" ? "недель" : "месяцев"})` : ""

      planContext = `\n\nУ пациента есть персональный план ${planType}${periodText}:\n\n`
      planContext += `Резюме плана: ${planData.summary}\n\n`

      planContext += "Детальный план по периодам:\n"
      planData.weeklyPlan.forEach((item) => {
        planContext += `\n${item.period}:\n`
        if (item.goals?.length > 0) {
          planContext += `Цели: ${item.goals.join(", ")}\n`
        }
        if (item.activities?.length > 0) {
          planContext += `Активности: ${item.activities.join(", ")}\n`
        }
        if (item.tips?.length > 0) {
          planContext += `Советы: ${item.tips.join(", ")}\n`
        }
      })

      if (planData.warnings?.length > 0) {
        planContext += `\n\nВажные предупреждения: ${planData.warnings.join("; ")}\n`
      }
    }

    const systemPrompt = `Ты - опытный врач-гинеколог и специалист по беременности и развитию детей. Твоя задача - давать профессиональные, заботливые и понятные ответы на вопросы беременных женщин и молодых мам.

Важные правила:
- Всегда будь доброжелательным и поддерживающим
- Давай конкретные, практичные советы
- Если вопрос требует срочной медицинской помощи, обязательно рекомендуй обратиться к врачу
- Используй простой, понятный язык без сложных медицинских терминов
- Будь кратким, но информативным
- Отвечай на русском языке
- Если у пациента есть персональный план, используй его для более точных рекомендаций
- Если пациент спрашивает о конкретной неделе/месяце из плана, дай детальный ответ на основе этого плана

Помощь по использованию приложения Smart Mama:
- Чтобы создать план: заполните форму слева (выберите режим, укажите срок и цель), затем нажмите "Сгенерировать план"
- Режим "Беременность": для планирования по неделям беременности (1-42 недели)
- Режим "Ребёнок": для планирования развития ребёнка по месяцам (0-36 месяцев)
- Календарь: переключитесь на вид календаря, чтобы видеть план в календарном формате
- Можете задавать вопросы о любой неделе/месяце из вашего плана
${planContext}
${conversationHistory ? `\nИстория разговора:\n${conversationHistory}\n` : ""}

Новый вопрос пациента: ${message}`

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
                  text: systemPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Gemini API error:", errorData)
      throw new Error("Ошибка API Gemini")
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      throw new Error("Не удалось получить ответ от AI")
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Error in AI doctor chat:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Внутренняя ошибка сервера" },
      { status: 500 },
    )
  }
}
