export interface CalorieItem {
  item_name: string
  total_calories: number
  total_protien: number
  toal_carbs: number
  toal_fats: number
}

export interface MealEntry {
  id: string
  timestamp: string
  imageUrl: string
  items: CalorieItem[]
  aiSummary?: string
  healthTips?: string[]
}

export interface NutritionGoals {
  dailyCalories: number
  dailyProtein: number
  dailyCarbs: number
  dailyFats: number
}

export interface UserPreferences {
  theme: "light" | "dark"
  voiceEnabled: boolean
  nutritionGoals: NutritionGoals
  units: "metric" | "imperial"
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}
