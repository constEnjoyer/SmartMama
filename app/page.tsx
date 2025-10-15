"use client"

import { useState } from "react"
import { AlertTriangle, Baby, Heart, Loader2, Menu, X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getStaticExample } from "@/lib/openai-client"
import { CalendarView } from "@/components/calendar-view"
import { AIDoctorChat } from "@/components/ai-doctor-chat"
import type { PlanResponse } from "@/lib/types"

export default function SmartMamaApp() {
  const [mode, setMode] = useState<"pregnancy" | "child">("pregnancy")
  const [period, setPeriod] = useState("")
  const [goal, setGoal] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<PlanResponse | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState<"main" | "calendar">("main")

  const handleGenerate = async (useStatic = false) => {
    setError("")
    setLoading(true)
    setResult(null)
    setSidebarOpen(false)

    try {
      if (useStatic) {
        const staticData = getStaticExample(mode)
        setResult(staticData)
      } else {
        if (!period.trim()) {
          throw new Error("Пожалуйста, укажите срок")
        }

        const response = await fetch("/api/generate-plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode,
            period,
            goals: goal.trim() || "Общее развитие и здоровье",
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Ошибка при генерации плана")
        }

        const data = await response.json()
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-full lg:w-80 bg-white border-r border-pink-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto flex flex-col
        `}
      >
        <div className="p-6 space-y-6 flex-1">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-8 h-8 text-pink-400" />
              <h1 className="text-2xl font-bold text-gray-800 font-display">Smart Mama</h1>
              <Baby className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-sm text-gray-600">Персональный помощник</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Режим</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={mode === "pregnancy" ? "default" : "outline"}
                onClick={() => setMode("pregnancy")}
                size="sm"
                className="w-full"
              >
                <Heart className="w-4 h-4 mr-1" />
                Беременность
              </Button>
              <Button
                variant={mode === "child" ? "default" : "outline"}
                onClick={() => setMode("child")}
                size="sm"
                className="w-full"
              >
                <Baby className="w-4 h-4 mr-1" />
                Ребёнок
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period" className="text-sm font-semibold text-gray-700">
              {mode === "pregnancy" ? "Неделя беременности" : "Возраст ребёнка (месяцы)"}
            </Label>
            <Input
              id="period"
              type="number"
              min="1"
              max={mode === "pregnancy" ? "42" : "36"}
              placeholder={mode === "pregnancy" ? "20" : "6"}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border-pink-200 focus:border-pink-400"
            />
            <p className="text-xs text-gray-500">{mode === "pregnancy" ? "От 1 до 42 недель" : "От 0 до 36 месяцев"}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal" className="text-sm font-semibold text-gray-700">
              Основная цель
            </Label>
            <Input
              id="goal"
              type="text"
              placeholder="Например: здоровое питание"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="border-pink-200 focus:border-pink-400"
            />
            <p className="text-xs text-gray-500">Оставьте пустым для общих рекомендаций</p>
          </div>

          <div className="space-y-2">
            <Button onClick={() => handleGenerate(false)} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерация...
                </>
              ) : (
                "Сгенерировать план"
              )}
            </Button>
            <Button
              onClick={() => handleGenerate(true)}
              disabled={loading}
              variant="outline"
              className="w-full border-pink-200 hover:bg-pink-50"
              size="sm"
            >
              Показать пример
            </Button>
          </div>
        </div>

        <div className="p-6 pt-0 mt-auto border-t border-pink-200">
          <Button
            onClick={() => {
              setCurrentView("calendar")
              setSidebarOpen(false)
            }}
            variant="outline"
            className="w-full border-pink-300 hover:bg-pink-100 text-pink-700"
            size="lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Календарь
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {result && (
            <div className="flex gap-2 mb-6">
              <Button
                variant={currentView === "main" ? "default" : "outline"}
                onClick={() => setCurrentView("main")}
                size="sm"
                className={currentView === "main" ? "" : "border-pink-200 hover:bg-pink-50"}
              >
                Основной вид
              </Button>
              <Button
                variant={currentView === "calendar" ? "default" : "outline"}
                onClick={() => setCurrentView("calendar")}
                size="sm"
                className={currentView === "calendar" ? "" : "border-pink-200 hover:bg-pink-50"}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Календарь
              </Button>
            </div>
          )}

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {currentView === "calendar" ? (
            <CalendarView planData={result} mode={mode} />
          ) : (
            <>
              <AIDoctorChat planData={result} mode={mode} period={period} />

              {!result && !error && (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Heart className="w-16 h-16 text-pink-300" />
                      <Baby className="w-16 h-16 text-purple-300" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-700 font-display">Добро пожаловать в Smart Mama</h2>
                    <p className="text-gray-500 max-w-md">
                      Заполните форму слева и нажмите "Сгенерировать план", чтобы получить персонализированные
                      рекомендации
                    </p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  <Card className="border-2 border-pink-200 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100">
                      <CardTitle className="text-gray-800 font-display">Резюме</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-gray-700 leading-relaxed">{result.summary}</p>
                    </CardContent>
                  </Card>

                  {result.warnings && result.warnings.length > 0 && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription>
                        <strong className="text-amber-900">Важные предупреждения:</strong>
                        <ul className="mt-2 space-y-1 text-amber-800">
                          {result.warnings.map((warning, idx) => (
                            <li key={idx}>• {warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 font-display">
                      {mode === "pregnancy" ? "План по неделям" : "План по месяцам"}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {result.weeklyPlan.map((item, idx) => (
                        <Card key={idx} className="border-2 border-pink-200 hover:shadow-lg transition-shadow">
                          <CardHeader className="bg-gradient-to-br from-pink-50 to-purple-50">
                            <CardTitle className="text-lg text-gray-800 font-display">{item.period}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-6">
                            {item.goals && item.goals.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm text-pink-700 mb-2">Цели:</h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {item.goals.map((goal, gIdx) => (
                                    <li key={gIdx}>• {goal}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.activities && item.activities.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm text-purple-700 mb-2">Активности:</h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {item.activities.map((activity, aIdx) => (
                                    <li key={aIdx}>• {activity}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.tips && item.tips.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm text-blue-700 mb-2">Советы:</h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {item.tips.map((tip, tIdx) => (
                                    <li key={tIdx}>• {tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {result.checklists && result.checklists.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-4 text-gray-800 font-display">Чек-листы</h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {result.checklists.map((checklist, idx) => (
                          <Card key={idx} className="border-2 border-pink-200 hover:shadow-lg transition-shadow">
                            <CardHeader className="bg-gradient-to-br from-pink-50 to-purple-50">
                              <CardTitle className="text-lg text-gray-800 font-display">{checklist.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                              <ul className="space-y-2">
                                {checklist.items.map((item, iIdx) => (
                                  <li key={iIdx} className="flex items-start gap-2">
                                    <input
                                      type="checkbox"
                                      defaultChecked={item.done}
                                      className="mt-1 rounded border-pink-300 text-pink-500 focus:ring-pink-500"
                                    />
                                    <span className="text-sm text-gray-700">{item.text}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
