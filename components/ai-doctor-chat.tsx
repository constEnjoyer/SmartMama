"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send, Stethoscope, ChevronDown, ChevronUp } from "lucide-react"
import type { PlanResponse } from "@/lib/types"

interface Message {
  role: "user" | "assistant"
  content: string
}

const SUGGESTED_QUESTIONS = [
  "Какие витамины нужно принимать во время беременности?",
  "Что делать при токсикозе?",
  "Какие упражнения безопасны для беременных?",
  "Как правильно питаться во время беременности?",
  "Когда нужно обратиться к врачу?",
  "Что можно принимать от головной боли?",
  "Как пользоваться этим приложением?",
]

interface AIDoctorChatProps {
  planData?: PlanResponse | null
  mode?: "pregnancy" | "child"
  period?: string
}

export function AIDoctorChat({ planData, mode, period }: AIDoctorChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const shouldScrollRef = useRef(true)

  const scrollToBottom = () => {
    if (shouldScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return

    const userMessage: Message = { role: "user", content: question }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)
    setIsExpanded(true)
    shouldScrollRef.current = true

    try {
      const response = await fetch("/api/ai-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          history: messages,
          planData,
          mode,
          period,
        }),
      })

      if (!response.ok) throw new Error("Ошибка при получении ответа")

      const data = await response.json()
      const assistantMessage: Message = { role: "assistant", content: data.response }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Извините, произошла ошибка. Пожалуйста, попробуйте позже.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    shouldScrollRef.current = false
  }

  return (
    <Card className="border-2 border-pink-200 shadow-lg mb-6 overflow-hidden">
      <CardHeader
        className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full">
              <Stethoscope className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <CardTitle className="text-gray-800 font-display">AI-Врач онлайн</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Нужна помощь? Задайте вопрос нашему AI-врачу по беременности</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-6 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-medium">Часто задаваемые вопросы:</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SUGGESTED_QUESTIONS.map((question, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(question)}
                    disabled={loading}
                    className="text-left h-auto py-2 px-3 border-pink-200 hover:bg-pink-50 hover:border-pink-300 text-xs justify-start"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {messages.map((message, idx) => (
                <div key={idx} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Задайте свой вопрос..."
              disabled={loading}
              className="flex-1 border-pink-200 focus:border-pink-400"
            />
            <Button type="submit" disabled={loading || !input.trim()} size="icon">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  )
}
