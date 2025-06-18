"use client"

import { Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"

interface ThemeToggleProps {
  theme: "light" | "dark"
  onToggle: () => void
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div initial={false} animate={{ rotate: theme === "dark" ? 180 : 0 }} transition={{ duration: 0.3 }}>
        {theme === "light" ? <Moon className="text-white" size={20} /> : <Sun className="text-white" size={20} />}
      </motion.div>
    </motion.button>
  )
}
