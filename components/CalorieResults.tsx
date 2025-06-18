"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Beef, GrapeIcon as Grain, Droplet, AlertTriangle } from "lucide-react"
import NutritionBadges from "./NutritionBadges"
import HealthCoachTips from "./HealthCoachTips"
import AnimatedMacroCircle from "./AnimatedMacroCircle"
import type { CalorieItem } from "@/types"

interface CalorieResultsProps {
  items: CalorieItem[]
  aiSummary?: string | null
  healthTips?: string[]
  isEstimated?: boolean
}

export default function CalorieResults({ items, aiSummary, healthTips, isEstimated = false }: CalorieResultsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [speakEnabled, setSpeakEnabled] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Calculate totals
  const totalCalories = items.reduce((sum, item) => sum + item.total_calories, 0)
  const totalProtein = items.reduce((sum, item) => sum + item.total_protien, 0)
  const totalCarbs = items.reduce((sum, item) => sum + item.toal_carbs, 0)
  const totalFats = items.reduce((sum, item) => sum + item.toal_fats, 0)

  // Speak summary if enabled
  useEffect(() => {
    if (speakEnabled && "speechSynthesis" in window) {
      const summary = `Your meal contains ${totalCalories} calories, with ${totalProtein} grams of protein, ${totalCarbs} grams of carbs, and ${totalFats} grams of fat.`
      const utterance = new SpeechSynthesisUtterance(summary)
      window.speechSynthesis.speak(utterance)
    }
  }, [speakEnabled, totalCalories, totalProtein, totalCarbs, totalFats])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-3 mb-8">
        <h2 className="text-2xl font-bold text-white text-center">Nutritional Analysis</h2>
        {isEstimated && (
          <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">
            <AlertTriangle size={14} />
            <span>Estimated</span>
          </div>
        )}
      </div>

      {/* Macro Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 mb-6"
      >
        <h3 className="text-xl font-bold text-white mb-6 text-center">Macro Nutrients</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <AnimatedMacroCircle
            value={totalCalories}
            maxValue={2000}
            label="Calories"
            color="#3b82f6"
            unit="cal"
            icon={<Sparkles size={20} />}
          />

          <AnimatedMacroCircle
            value={totalProtein}
            maxValue={50}
            label="Protein"
            color="#10b981"
            unit="g"
            icon={<Beef size={20} />}
          />

          <AnimatedMacroCircle
            value={totalCarbs}
            maxValue={300}
            label="Carbs"
            color="#f59e0b"
            unit="g"
            icon={<Grain size={20} />}
          />

          <AnimatedMacroCircle
            value={totalFats}
            maxValue={65}
            label="Fats"
            color="#8b5cf6"
            unit="g"
            icon={<Droplet size={20} />}
          />
        </div>
      </motion.div>

      {/* Food Items */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const foodEmoji = getFoodEmoji(item.item_name)

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{foodEmoji}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.item_name}</h3>
                {isEstimated && (
                  <span className="text-yellow-300 text-xs bg-yellow-500/20 px-2 py-1 rounded-full">
                    Estimated Values
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Calories</span>
                  <span className="font-bold text-white">{item.total_calories} cal</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/70">Protein</span>
                  <span className="font-bold text-white">{item.total_protien}g</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/70">Carbs</span>
                  <span className="font-bold text-white">{item.toal_carbs}g</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/70">Fats</span>
                  <span className="font-bold text-white">{item.toal_fats}g</span>
                </div>
              </div>

              <NutritionBadges items={[item]} />
            </motion.div>
          )
        })}
      </div>

      {/* Health Coach Tips */}
      {healthTips && healthTips.length > 0 && <HealthCoachTips items={items} customTips={healthTips} />}

      {aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="glass-card p-6 mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-yellow-400" size={24} />
              <h3 className="text-xl font-bold text-white">
                {isEstimated ? "Nutrition Summary" : "AI Nutrition Summary"}
              </h3>
            </div>

            <button
              onClick={() => setSpeakEnabled(!speakEnabled)}
              className="text-white/70 hover:text-white text-sm underline"
            >
              {speakEnabled ? "Stop Reading" : "Read Aloud"}
            </button>
          </div>
          <p className="text-white/80 text-lg italic">{aiSummary}</p>
        </motion.div>
      )}
    </div>
  )
}

// Helper function to get emoji based on food name
function getFoodEmoji(foodName: string): string {
  const name = foodName.toLowerCase()

  if (name.includes("apple")) return "🍎"
  if (name.includes("banana")) return "🍌"
  if (name.includes("pizza")) return "🍕"
  if (name.includes("burger") || name.includes("hamburger")) return "🍔"
  if (name.includes("salad")) return "🥗"
  if (name.includes("chicken")) return "🍗"
  if (name.includes("rice")) return "🍚"
  if (name.includes("pasta") || name.includes("spaghetti")) return "🍝"
  if (name.includes("bread")) return "🍞"
  if (name.includes("egg")) return "🥚"
  if (name.includes("cheese")) return "🧀"
  if (name.includes("cake")) return "🍰"
  if (name.includes("cookie")) return "🍪"
  if (name.includes("fish")) return "🐟"
  if (name.includes("meat")) return "🥩"
  if (name.includes("vegetable")) return "🥦"
  if (name.includes("fruit")) return "🍇"
  if (name.includes("estimated") || name.includes("mixed")) return "🍽️"

  // Default food emoji
  return "🍽️"
}
