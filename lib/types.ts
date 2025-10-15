export interface PlanResponse {
  summary: string
  weeklyPlan: Array<{
    period: string
    goals: string[]
    activities: string[]
    tips: string[]
  }>
  checklists: Array<{
    title: string
    items: Array<{
      text: string
      done: boolean
    }>
  }>
  warnings: string[]
}

export interface GeneratePlanParams {
  apiKey: string
  mode: "pregnancy" | "child"
  period: string
  goals: string
  userInfo: string
}

export interface DailyTask {
  id: string
  text: string
  completed: boolean
  custom?: boolean
}

export interface DayCompletion {
  date: string
  completed: boolean
  tasks: DailyTask[]
}
