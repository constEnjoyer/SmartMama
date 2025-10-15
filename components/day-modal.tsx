"use client"

import { useState } from "react"
import { X, Plus, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DailyTask } from "@/lib/types"

interface DayModalProps {
  date: Date
  dayNumber: number
  goals: string[]
  activities: string[]
  tips: string[]
  tasks: DailyTask[]
  isCompleted: boolean
  onClose: () => void
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onAddTask: (text: string) => void
  onToggleDayComplete: () => void
}

export function DayModal({
  date,
  dayNumber,
  goals,
  activities,
  tips,
  tasks,
  isCompleted,
  onClose,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onToggleDayComplete,
}: DayModalProps) {
  const [newTaskText, setNewTaskText] = useState("")

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim())
      setNewTaskText("")
    }
  }

  const monthNames = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-pink-200">
        <CardHeader className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 border-b border-pink-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {dayNumber} {monthNames[date.getMonth()]} {date.getFullYear()}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/50">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <Button
            variant={isCompleted ? "default" : "outline"}
            size="sm"
            onClick={onToggleDayComplete}
            className={`mt-2 ${isCompleted ? "bg-green-500 hover:bg-green-600" : ""}`}
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                День завершен
              </>
            ) : (
              "Отметить день как завершенный"
            )}
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {goals.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-pink-700 flex items-center gap-2">🎯 Цели на сегодня</h3>
              <ul className="space-y-2">
                {goals.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 bg-pink-50 p-3 rounded-lg">
                    <span className="text-pink-500 font-bold">•</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2">✨ Активности</h3>
              <ul className="space-y-2">
                {activities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 bg-purple-50 p-3 rounded-lg">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tips.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">💡 Советы</h3>
              <ul className="space-y-2">
                {tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 bg-blue-50 p-3 rounded-lg">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t-2 border-pink-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">📝 Задачи на день</h3>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                    className="w-5 h-5 rounded border-pink-300 text-pink-500 focus:ring-pink-500 cursor-pointer"
                  />
                  <span className={`flex-1 ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                    {task.text}
                  </span>
                  {task.custom && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Добавить свою задачу..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                className="flex-1 border-pink-200 focus:border-pink-400"
              />
              <Button onClick={handleAddTask} className="bg-pink-500 hover:bg-pink-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
