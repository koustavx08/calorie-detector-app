"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, Lightbulb, Droplets, Salad } from "lucide-react"
import type { CalorieItem } from "@/types"

interface HealthCoachTipsProps {
  items: CalorieItem[]
  customTips?: string[]
}

export default function HealthCoachTips({ items, customTips }: HealthCoachTipsProps) {
  const [tips, setTips] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateTips = async () => {
      setIsLoading(true)
      try {
        if (customTips && customTips.length > 0) {
          setTips(customTips)
        } else {
          const generatedTips = generateStaticTips(items)
          setTips(generatedTips)
        }
      } catch (error) {
        // Fallback to static tips if anything fails
        setTips(generateStaticTips(items))
      } finally {
        setIsLoading(false)
      }
    }

    generateTips()
  }, [items, customTips])

  const generateStaticTips = (foodItems: CalorieItem[]): string[] => {
    const totalCalories = foodItems.reduce((sum, item) => sum + item.total_calories, 0)
    const totalProtein = foodItems.reduce((sum, item) => sum + item.total_protien, 0)
    const totalCarbs = foodItems.reduce((sum, item) => sum + item.toal_carbs, 0)
    const totalFats = foodItems.reduce((sum, item) => sum + item.toal_fats, 0)

    const tips: string[] = []

    // Calorie-based tips
    if (totalCalories > 600) {
      tips.push(
        "Consider splitting this meal into two smaller portions to help with digestion and energy distribution throughout the day.",
      )
    } else if (totalCalories < 300) {
      tips.push("This is a light meal - perfect for maintaining a healthy calorie balance!")
    }

    // Protein-based tips
    if (totalProtein < 15) {
      tips.push(
        "This meal is a bit low in protein. Consider adding Greek yogurt, eggs, or a handful of nuts to boost your protein intake.",
      )
    } else if (totalProtein > 40) {
      tips.push(
        "This meal is high in protein, which is great for muscle recovery. Remember to stay hydrated when consuming high-protein meals.",
      )
    }

    // Carb-based tips
    if (totalCarbs > 60) {
      tips.push(
        "This meal is carb-heavy. Try to balance it with fiber-rich vegetables to slow digestion and prevent blood sugar spikes.",
      )
    }

    // Fat-based tips
    if (totalFats > 25) {
      tips.push("This meal contains significant healthy fats. Consider drinking extra water to aid digestion.")
    }

    // Water reminder
    tips.push("Remember to drink water with your meal to aid digestion and stay hydrated.")

    // Alternative suggestions
    if (totalCalories > 500) {
      tips.push("For a lighter alternative, consider replacing some ingredients with vegetables or lean proteins.")
    }

    // General health tips
    tips.push("Try to eat mindfully by chewing slowly and enjoying each bite without distractions.")

    // Return a subset of tips (3-4 tips)
    return tips.slice(0, Math.min(4, tips.length))
  }

  const tipIcons = [Lightbulb, Droplets, Salad, Sparkles]

  if (isLoading) {
    return (
      <div className="glass-card p-6 mt-8 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-yellow-400" size={24} />
          <h3 className="text-xl font-bold text-white">Health Coach Tips</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="h-6 bg-white/10 rounded-md w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-6 mt-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-yellow-400" size={24} />
        <h3 className="text-xl font-bold text-white">Health Coach Tips</h3>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => {
          const Icon = tipIcons[index % tipIcons.length]
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex gap-3"
            >
              <div className="mt-1">
                <Icon size={18} className="text-white/70" />
              </div>
              <p className="text-white/80">{tip}</p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
