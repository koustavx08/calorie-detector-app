"use client"

import { Award, Zap, Shield, Heart } from "lucide-react"
import type { CalorieItem } from "@/types"

interface NutritionBadgesProps {
  items: CalorieItem[]
}

export default function NutritionBadges({ items }: NutritionBadgesProps) {
  const totalCalories = items.reduce((sum, item) => sum + item.total_calories, 0)
  const totalProtein = items.reduce((sum, item) => sum + item.total_protien, 0)
  const totalCarbs = items.reduce((sum, item) => sum + item.toal_carbs, 0)
  const totalFats = items.reduce((sum, item) => sum + item.toal_fats, 0)

  const badges = []

  // Low Calorie Badge
  if (totalCalories < 300) {
    badges.push({
      icon: Zap,
      label: "Light Meal",
      color: "bg-green-500/80",
      description: "Under 300 calories",
    })
  }

  // High Protein Badge
  if (totalProtein > 20) {
    badges.push({
      icon: Shield,
      label: "High Protein",
      color: "bg-blue-500/80",
      description: "Over 20g protein",
    })
  }

  // Balanced Meal Badge
  const proteinRatio = totalProtein / (totalProtein + totalCarbs + totalFats)
  const carbRatio = totalCarbs / (totalProtein + totalCarbs + totalFats)
  const fatRatio = totalFats / (totalProtein + totalCarbs + totalFats)

  if (proteinRatio > 0.2 && carbRatio > 0.3 && fatRatio > 0.15 && fatRatio < 0.4) {
    badges.push({
      icon: Heart,
      label: "Balanced",
      color: "bg-purple-500/80",
      description: "Well-balanced macros",
    })
  }

  // Healthy Choice Badge
  if (totalCalories < 500 && totalProtein > 15) {
    badges.push({
      icon: Award,
      label: "Healthy Choice",
      color: "bg-emerald-500/80",
      description: "Nutritious and moderate",
    })
  }

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {badges.map((badge, index) => (
        <div
          key={index}
          className={`${badge.color} text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}
          title={badge.description}
        >
          <badge.icon size={12} />
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  )
}
