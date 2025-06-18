"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import type { MealEntry } from "@/types"

interface VoiceAssistantProps {
  mealHistory: MealEntry[]
  onCommand: (command: string) => void
  isListening: boolean
  toggleListening: () => void
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    SpeechSynthesis: any
  }
}

export default function VoiceAssistant({ mealHistory, onCommand, isListening, toggleListening }: VoiceAssistantProps) {
  const [transcript, setTranscript] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex
        const result = event.results[current]
        const transcriptText = result[0].transcript.trim().toLowerCase()
        setTranscript(transcriptText)

        if (result.isFinal) {
          processCommand(transcriptText)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        if (isListening) toggleListening()
      }
    }

    // Initialize speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        // Recognition might already be started
        console.log("Recognition already started")
      }
    } else if (!isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setTranscript("")
    }
  }, [isListening])

  const processCommand = (text: string) => {
    // Handle calorie queries
    if (text.includes("how many calories") || text.includes("calories today")) {
      const today = new Date().toISOString().split("T")[0]
      const todayMeals = mealHistory.filter((meal) => meal.timestamp.split("T")[0] === today)
      const totalCalories = todayMeals.reduce(
        (sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + item.total_calories, 0),
        0,
      )

      const response = `You've consumed approximately ${totalCalories} calories today from ${todayMeals.length} meals.`
      speak(response)
      return
    }

    // Handle upload commands
    if (text.includes("upload image") || text.includes("take photo") || text.includes("scan food")) {
      onCommand("upload")
      speak("Opening the camera to scan your food.")
      return
    }

    // Handle history commands
    if (text.includes("show history") || text.includes("meal history")) {
      onCommand("history")
      speak("Here's your meal history.")
      return
    }

    // Handle insights commands
    if (text.includes("show insights") || text.includes("nutrition insights") || text.includes("show stats")) {
      onCommand("insights")
      speak("Here are your nutrition insights.")
      return
    }

    // Handle barcode commands
    if (text.includes("scan barcode") || text.includes("barcode scanner")) {
      onCommand("barcode")
      speak("Opening the barcode scanner.")
      return
    }

    // Handle tips commands
    if (text.includes("nutrition tips") || text.includes("health tips")) {
      speak(
        "Here are some nutrition tips: Stay hydrated by drinking water throughout the day. Include a variety of colorful vegetables in your meals. Choose whole grains over refined grains when possible.",
      )
      return
    }

    // Handle help commands
    if (text.includes("help") || text.includes("what can you do")) {
      speak(
        "You can ask me questions like 'How many calories did I eat today?' or give commands like 'Upload image', 'Show history', 'Show insights', or 'Scan barcode'.",
      )
      return
    }

    // Default response
    speak("I didn't understand that command. Try asking about your calories today or say 'help' for assistance.")
  }

  const speak = (text: string) => {
    if (isMuted || !synthRef.current) return

    // Cancel any ongoing speech
    if (synthRef.current.speaking) {
      synthRef.current.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthRef.current.speak(utterance)
  }

  const toggleMute = () => {
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel()
    }
    setIsMuted(!isMuted)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end space-y-4">
        {/* Transcript bubble */}
        <AnimatePresence>
          {transcript && isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="glass-card p-3 max-w-xs rounded-2xl rounded-br-none"
            >
              <p className="text-white text-sm">{transcript}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control buttons */}
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className={`p-3 rounded-full ${isMuted ? "bg-red-500/80" : "glass-card"} shadow-lg`}
            aria-label={isMuted ? "Unmute voice assistant" : "Mute voice assistant"}
          >
            {isMuted ? <VolumeX size={24} className="text-white" /> : <Volume2 size={24} className="text-white" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleListening}
            className={`p-4 rounded-full ${
              isListening ? "bg-green-500/80 animate-pulse-slow" : "glass-card"
            } shadow-lg`}
            aria-label={isListening ? "Stop listening" : "Start voice assistant"}
          >
            {isListening ? <Mic size={28} className="text-white" /> : <MicOff size={28} className="text-white" />}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
