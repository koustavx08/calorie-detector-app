"use client"

import { motion } from "framer-motion"
import { Trash2, RefreshCw, Calendar, TrendingUp } from "lucide-react"
import type { MealEntry } from "@/types"
import NutritionBadges from "./NutritionBadges"

interface HistoryDashboardProps {
  mealHistory: MealEntry[]
  onDeleteMeal: (id: string) => void
  onRecalculateMeal: (meal: MealEntry) => void
}

export default function HistoryDashboard({ mealHistory, onDeleteMeal, onRecalculateMeal }: HistoryDashboardProps) {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTotalCalories = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.total_calories, 0)
  }

  if (mealHistory.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Calendar size={64} className="mx-auto text-white/50 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">No Meals Yet</h3>
        <p className="text-white/70">Start by uploading your first meal photo!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-white" size={24} />
        <h2 className="text-2xl font-bold text-white">Meal History</h2>
        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">{mealHistory.length} meals</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mealHistory.map((meal, index) => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4 group hover:scale-105 transition-transform duration-300"
          >
            <div className="relative mb-4">
              <img
                src={meal.imageUrl || "/placeholder.svg"}
                alt="Meal"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => onRecalculateMeal(meal)}
                  className="p-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-full transition-colors"
                  title="Recalculate"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={() => onDeleteMeal(meal.id)}
                  className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">{formatDate(meal.timestamp)}</span>
                <span className="font-bold text-white text-lg">{getTotalCalories(meal.items)} cal</span>
              </div>

              <div className="space-y-2">
                {meal.items.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-white/80 truncate">{item.item_name}</span>
                    <span className="text-white font-medium">{item.total_calories} cal</span>
                  </div>
                ))}
                {meal.items.length > 2 && (
                  <div className="text-white/60 text-xs">+{meal.items.length - 2} more items</div>
                )}
              </div>

              <NutritionBadges items={meal.items} />

              {meal.aiSummary && (
                <div className="bg-white/10 rounded-lg p-3 mt-3">
                  <p className="text-white/80 text-sm italic">"{meal.aiSummary}"</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
