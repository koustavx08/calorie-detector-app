"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AnimatedMacroCircleProps {
  value: number
  maxValue: number
  label: string
  color: string
  icon: React.ReactNode
  unit: string
}

export default function AnimatedMacroCircle({ value, maxValue, label, color, icon, unit }: AnimatedMacroCircleProps) {
  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    // Animate from 0 to the actual percentage
    setPercentage(Math.min((value / maxValue) * 100, 100))
  }, [value, maxValue])

  const size = 120
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  // Calculate stroke-dashoffset
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Determine color based on percentage
  let statusColor = color
  if (label === "Protein" && percentage < 30) {
    statusColor = "#ef4444" // Red for low protein
  } else if (label === "Fats" && percentage > 80) {
    statusColor = "#ef4444" // Red for high fat
  } else if (label === "Carbs" && percentage > 90) {
    statusColor = "#f59e0b" // Amber for high carbs
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Background circle */}
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />

          {/* Animated progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={statusColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-white/70 mb-1">{icon}</div>
          <div className="text-xl font-bold text-white">
            {value}
            {unit}
          </div>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div className="text-white font-medium">{label}</div>
        <div className="text-white/70 text-sm">{Math.round(percentage)}% of goal</div>
      </div>
    </div>
  )
}
