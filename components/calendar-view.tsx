"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DayModal } from "@/components/day-modal"
import type { PlanResponse, DayCompletion, DailyTask } from "@/lib/types"

interface CalendarViewProps {
  planData: PlanResponse | null
  mode: "pregnancy" | "child"
}

export function CalendarView({ planData, mode }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [dayCompletions, setDayCompletions] = useState<Record<string, DayCompletion>>({})

  useEffect(() => {
    if (planData && planData.weeklyPlan) {
      const newCompletions: Record<string, DayCompletion> = {}
      const { year, month } = getDaysInMonth(currentDate)

      planData.weeklyPlan.forEach((weekPlan, weekIndex) => {
        const startDay = weekIndex * 7 + 1
        const endDay = Math.min(startDay + 6, getDaysInMonth(currentDate).daysInMonth)

        for (let day = startDay; day <= endDay; day++) {
          const dateKey = `${year}-${month + 1}-${day}`
          const tasks: DailyTask[] = []

          weekPlan.goals.forEach((goal, idx) => {
            tasks.push({
              id: `${dateKey}-goal-${idx}`,
              text: goal,
              completed: false,
              custom: false,
            })
          })

          weekPlan.activities.forEach((activity, idx) => {
            tasks.push({
              id: `${dateKey}-activity-${idx}`,
              text: activity,
              completed: false,
              custom: false,
            })
          })

          if (!newCompletions[dateKey]) {
            newCompletions[dateKey] = {
              date: dateKey,
              completed: false,
              tasks,
            }
          }
        }
      })

      setDayCompletions((prev) => ({ ...prev, ...newCompletions }))
    }
  }, [planData, currentDate])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)

  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ]

  const weekDays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getPlanForDay = (day: number) => {
    if (!planData || !planData.weeklyPlan) return null
    const planIndex = Math.floor((day - 1) / 7)
    return planData.weeklyPlan[planIndex] || null
  }

  const getDayKey = (day: number) => `${year}-${month + 1}-${day}`

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
  }

  const handleToggleTask = (taskId: string) => {
    if (!selectedDay) return
    const dateKey = getDayKey(selectedDay)
    setDayCompletions((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        tasks: prev[dateKey].tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
      },
    }))
  }

  const handleDeleteTask = (taskId: string) => {
    if (!selectedDay) return
    const dateKey = getDayKey(selectedDay)
    setDayCompletions((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        tasks: prev[dateKey].tasks.filter((task) => task.id !== taskId),
      },
    }))
  }

  const handleAddTask = (text: string) => {
    if (!selectedDay) return
    const dateKey = getDayKey(selectedDay)
    const newTask: DailyTask = {
      id: `${dateKey}-custom-${Date.now()}`,
      text,
      completed: false,
      custom: true,
    }
    setDayCompletions((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        tasks: [...(prev[dateKey]?.tasks || []), newTask],
      },
    }))
  }

  const handleToggleDayComplete = () => {
    if (!selectedDay) return
    const dateKey = getDayKey(selectedDay)
    setDayCompletions((prev) => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        completed: !prev[dateKey]?.completed,
      },
    }))
  }

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 md:h-28" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const planForDay = getPlanForDay(day)
    const hasData = planForDay !== null
    const dateKey = getDayKey(day)
    const dayCompletion = dayCompletions[dateKey]
    const isCompleted = dayCompletion?.completed || false
    const completedTasks = dayCompletion?.tasks.filter((t) => t.completed).length || 0
    const totalTasks = dayCompletion?.tasks.length || 0

    days.push(
      <Card
        key={day}
        onClick={() => hasData && handleDayClick(day)}
        className={`h-24 md:h-28 overflow-hidden transition-all ${
          hasData ? "cursor-pointer hover:shadow-lg hover:scale-105" : ""
        } ${
          isCompleted
            ? "bg-gradient-to-br from-green-100 to-emerald-100 border-green-300"
            : hasData
              ? "bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border-pink-200"
              : "bg-white border-gray-200"
        }`}
      >
        <CardContent className="p-2 h-full flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <div className="font-semibold text-sm">{day}</div>
            {isCompleted && <span className="text-green-600 text-xs">✓</span>}
          </div>
          {hasData && planForDay && (
            <div className="flex-1 overflow-hidden text-xs space-y-1">
              {planForDay.goals && planForDay.goals.length > 0 && (
                <div className="text-pink-700 font-medium truncate">🎯 {planForDay.goals[0]}</div>
              )}
              {totalTasks > 0 && (
                <div className="text-purple-600 text-xs">
                  📝 {completedTasks}/{totalTasks}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>,
    )
  }

  const selectedDayPlan = selectedDay ? getPlanForDay(selectedDay) : null
  const selectedDayKey = selectedDay ? getDayKey(selectedDay) : ""
  const selectedDayCompletion = selectedDay ? dayCompletions[selectedDayKey] : null

  return (
    <div className="space-y-6">
      <Card className="border-2 border-pink-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <CalendarIcon className="w-6 h-6 text-pink-500" />
              Календарь плана
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth} className="hover:bg-white bg-transparent">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-semibold min-w-[140px] text-center text-gray-800">
                {monthNames[month]} {year}
              </span>
              <Button variant="outline" size="sm" onClick={nextMonth} className="hover:bg-white bg-transparent">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!planData ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-pink-300" />
              <p className="text-lg font-medium text-gray-700">Календарь пуст</p>
              <p className="text-sm mt-2 text-gray-500">Сгенерируйте план, чтобы увидеть расписание</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">{days}</div>
              <div className="mt-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                <p className="text-sm text-pink-800">
                  <strong>Подсказка:</strong> Нажмите на день с планом, чтобы увидеть детали, задачи и отметить
                  выполнение. Зеленые дни - завершенные.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedDay && selectedDayPlan && (
        <DayModal
          date={new Date(year, month, selectedDay)}
          dayNumber={selectedDay}
          goals={selectedDayPlan.goals}
          activities={selectedDayPlan.activities}
          tips={selectedDayPlan.tips}
          tasks={selectedDayCompletion?.tasks || []}
          isCompleted={selectedDayCompletion?.completed || false}
          onClose={() => setSelectedDay(null)}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleAddTask}
          onToggleDayComplete={handleToggleDayComplete}
        />
      )}
    </div>
  )
}
