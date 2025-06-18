"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, Award, Target, Calendar } from "lucide-react"
import type { MealEntry } from "@/types"

interface InsightsDashboardProps {
  mealHistory: MealEntry[]
}

export default function InsightsDashboard({ mealHistory }: InsightsDashboardProps) {
  const analytics = useMemo(() => {
    if (mealHistory.length === 0) return null

    // Daily calorie trends (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    const dailyCalories = last7Days.map((date) => {
      const dayMeals = mealHistory.filter((meal) => meal.timestamp.split("T")[0] === date)
      const totalCalories = dayMeals.reduce(
        (sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + item.total_calories, 0),
        0,
      )
      return {
        date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        calories: totalCalories,
      }
    })

    // Macro distribution
    const totalMacros = mealHistory.reduce(
      (acc, meal) => {
        meal.items.forEach((item) => {
          acc.protein += item.total_protien
          acc.carbs += item.toal_carbs
          acc.fats += item.toal_fats
        })
        return acc
      },
      { protein: 0, carbs: 0, fats: 0 },
    )

    const macroData = [
      { name: "Protein", value: totalMacros.protein, color: "#10B981" },
      { name: "Carbs", value: totalMacros.carbs, color: "#3B82F6" },
      { name: "Fats", value: totalMacros.fats, color: "#F59E0B" },
    ]

    // Weekly summary
    const totalCalories = mealHistory.reduce(
      (sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + item.total_calories, 0),
      0,
    )
    const avgCaloriesPerMeal = totalCalories / mealHistory.length
    const healthyMeals = mealHistory.filter((meal) => {
      const mealCalories = meal.items.reduce((sum, item) => sum + item.total_calories, 0)
      return mealCalories < 500
    }).length

    return {
      dailyCalories,
      macroData,
      totalCalories,
      avgCaloriesPerMeal,
      healthyMeals,
      totalMeals: mealHistory.length,
    }
  }, [mealHistory])

  if (!analytics) {
    return (
      <div className="glass-card p-12 text-center">
        <BarChart size={64} className="mx-auto text-white/50 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">No Data Yet</h3>
        <p className="text-white/70">Upload some meals to see your insights!</p>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Calories",
      value: analytics.totalCalories.toLocaleString(),
      icon: Target,
      color: "from-blue-500 to-purple-600",
    },
    {
      title: "Avg Per Meal",
      value: Math.round(analytics.avgCaloriesPerMeal).toLocaleString(),
      icon: TrendingUp,
      color: "from-green-500 to-blue-500",
    },
    {
      title: "Healthy Meals",
      value: `${analytics.healthyMeals}/${analytics.totalMeals}`,
      icon: Award,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Days Tracked",
      value: new Set(mealHistory.map((m) => m.timestamp.split("T")[0])).size.toString(),
      icon: Calendar,
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <BarChart className="text-white" size={24} />
        <h2 className="text-2xl font-bold text-white">Nutrition Insights</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4"
          >
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}
            >
              <stat.icon className="text-white" size={24} />
            </div>
            <h3 className="text-white/70 text-sm font-medium">{stat.title}</h3>
            <p className="text-white text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Daily Calorie Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Daily Calorie Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyCalories}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Macro Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Macro Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.macroData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analytics.macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Weekly Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">Weekly Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.dailyCalories}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
            <YAxis stroke="rgba(255,255,255,0.7)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "none",
                borderRadius: "8px",
                color: "white",
              }}
            />
            <Bar dataKey="calories" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
