"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Toaster } from "react-hot-toast"
import ImageUpload from "@/components/ImageUpload"
import CalorieResults from "@/components/CalorieResults"
import LoadingSpinner from "@/components/LoadingSpinner"
import HistoryDashboard from "@/components/HistoryDashboard"
import InsightsDashboard from "@/components/InsightsDashboard"
import ThemeToggle from "@/components/ThemeToggle"
import VoiceAssistant from "@/components/VoiceAssistant"
import BarcodeScanner from "@/components/BarcodeScanner"
import ErrorBoundary from "@/components/ErrorBoundary"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useTheme } from "@/hooks/useTheme"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { nutritionService } from "@/services/nutritionService"
import { groqService } from "@/services/groqService"
import { cacheService } from "@/services/cacheService"
import type { CalorieItem, MealEntry } from "@/types"
import { Upload, History, BarChart3, Barcode, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

type TabType = "upload" | "history" | "insights" | "barcode"

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("upload")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [calorieData, setCalorieData] = useState<CalorieItem[] | null>(null)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [healthTips, setHealthTips] = useState<string[]>([])
  const [mealHistory, setMealHistory] = useLocalStorage<MealEntry[]>("meal-history", [])
  const [isVoiceListening, setIsVoiceListening] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [analysisMode, setAnalysisMode] = useState<"ai" | "estimated">("ai")
  const { theme, toggleTheme } = useTheme()
  const isOnline = useOnlineStatus()
  const { handleError, clearError } = useErrorHandler()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showCamera, setShowCamera] = useState(false)

  // Register service worker for PWA
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("SW registered: ", registration)
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError)
          })
      })
    }
  }, [])

  const handleFileSelect = async (file: File) => {
    clearError()
    setCalorieData(null)
    setAiSummary(null)
    setHealthTips([])
    setAnalysisMode("ai")

    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      setIsUploading(true)

      // Upload image to ImgBB
      const imageUrl = await nutritionService.uploadImage(file)
      setIsUploading(false)

      setIsAnalyzing(true)

      // Try AI analysis first
      try {
        const analysisResult = await groqService.analyzeImage(imageUrl)

        // Generate AI summary and health tips (run in parallel but handle errors separately)
        const [summary, tips] = await Promise.allSettled([
          groqService.generateMealSummary(analysisResult.items),
          groqService.generateHealthTips(analysisResult.items),
        ])

        const finalSummary = summary.status === "fulfilled" ? summary.value : "Great meal choice!"
        const finalTips = tips.status === "fulfilled" ? tips.value : []

        const newMealEntry: MealEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          imageUrl: selectedImage!,
          items: analysisResult.items,
          aiSummary: finalSummary,
          healthTips: finalTips,
        }

        // Cache the meal entry
        await cacheService.cacheMealEntry(newMealEntry)

        setMealHistory((prev) => [newMealEntry, ...prev])
        setCalorieData(analysisResult.items)
        setAiSummary(finalSummary)
        setHealthTips(finalTips)
        setAnalysisMode("ai")
        setIsAnalyzing(false)

        toast.success("Meal analyzed with AI successfully!")
      } catch (aiError) {
        console.error("AI Analysis failed:", aiError)

        // Fallback to estimated analysis
        setAnalysisMode("estimated")

        const estimatedItems: CalorieItem[] = [
          {
            item_name: "Estimated Meal",
            total_calories: 300,
            total_protien: 18,
            toal_carbs: 35,
            toal_fats: 12,
          },
        ]

        const estimatedSummary =
          "AI analysis unavailable. This is an estimated nutritional breakdown based on typical meal composition."
        const estimatedTips = [
          "Try to include a variety of colorful vegetables in your meals for optimal nutrition.",
          "Aim for a balance of protein, carbs, and healthy fats in each meal.",
          "Stay hydrated by drinking water throughout the day.",
          "Consider portion sizes to maintain a healthy calorie balance.",
        ]

        const newMealEntry: MealEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          imageUrl: selectedImage!,
          items: estimatedItems,
          aiSummary: estimatedSummary,
          healthTips: estimatedTips,
        }

        setMealHistory((prev) => [newMealEntry, ...prev])
        setCalorieData(estimatedItems)
        setAiSummary(estimatedSummary)
        setHealthTips(estimatedTips)
        setIsAnalyzing(false)

        toast.error("AI analysis failed. Showing estimated values.", {
          icon: "⚠️",
          duration: 6000,
        })
      }
    } catch (error) {
      setIsUploading(false)
      setIsAnalyzing(false)

      console.error("Analysis error:", error)

      if (!isOnline) {
        // Try to get cached response
        try {
          const cachedResponse = await cacheService.getCachedAnalysis(file)
          if (cachedResponse) {
            setCalorieData(cachedResponse.items)
            setAiSummary(cachedResponse.aiSummary || null)
            setHealthTips(cachedResponse.healthTips || [])
            toast.success("Using cached analysis (offline mode)")
            return
          }
        } catch (cacheError) {
          console.error("Cache error:", cacheError)
        }
      }

      handleError(error as Error, "Failed to process image")
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowCamera(true)
      }
    } catch (error) {
      handleError(error as Error, "Camera access denied")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0)

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" })
          handleFileSelect(file)
        }
      }, "image/jpeg")

      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      setShowCamera(false)
    }
  }

  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case "upload":
        setActiveTab("upload")
        startCamera()
        break
      case "history":
        setActiveTab("history")
        break
      case "insights":
        setActiveTab("insights")
        break
      case "barcode":
        setActiveTab("barcode")
        setShowBarcodeScanner(true)
        break
      default:
        break
    }
  }

  const handleBarcodeScanComplete = async (barcode: string) => {
    setShowBarcodeScanner(false)

    try {
      const nutritionData = await nutritionService.getNutritionByBarcode(barcode)

      if (nutritionData) {
        const items = [nutritionData]
        const [summary, tips] = await Promise.allSettled([
          groqService.generateMealSummary(items),
          groqService.generateHealthTips(items),
        ])

        const finalSummary = summary.status === "fulfilled" ? summary.value : "Product scanned successfully!"
        const finalTips = tips.status === "fulfilled" ? tips.value : []

        const newMealEntry: MealEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          imageUrl: "/placeholder.svg?height=300&width=300",
          items,
          aiSummary: finalSummary,
          healthTips: finalTips,
        }

        setMealHistory((prev) => [newMealEntry, ...prev])
        setCalorieData(items)
        setAiSummary(finalSummary)
        setHealthTips(finalTips)
        setActiveTab("upload")

        toast.success("Product scanned successfully!")
      }
    } catch (error) {
      handleError(error as Error, "Failed to scan barcode")
    }
  }

  const tabs = [
    { id: "upload" as TabType, label: "Upload", icon: Upload },
    { id: "history" as TabType, label: "History", icon: History },
    { id: "insights" as TabType, label: "Insights", icon: BarChart3 },
    { id: "barcode" as TabType, label: "Barcode", icon: Barcode },
  ]

  return (
    <ErrorBoundary>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"
            : "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8 relative">
            <div className="absolute top-0 right-0">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg"
            >
              Calorie Counter Pro
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/80 text-lg"
            >
              AI-powered nutrition tracking with real-time data
            </motion.p>

            {!isOnline && (
              <div className="mt-2 bg-yellow-500/80 text-white px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Offline Mode
              </div>
            )}
          </header>

          <div className="max-w-6xl mx-auto">
            {/* Tab Navigation */}
            <div className="glass-card p-2 mb-8">
              <div className="flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      if (tab.id === "barcode") {
                        setShowBarcodeScanner(true)
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                    aria-label={`Switch to ${tab.label} tab`}
                  >
                    <tab.icon size={20} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis Mode Indicator */}
            {analysisMode === "estimated" && calorieData && (
              <div className="glass-card p-4 mb-6 border-l-4 border-yellow-400">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-yellow-400" size={24} />
                  <div>
                    <h3 className="text-white font-semibold">Estimated Analysis</h3>
                    <p className="text-white/70 text-sm">
                      AI analysis is currently unavailable. Showing estimated nutritional values.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "upload" && (
                  <div>
                    {!selectedImage && !showCamera && (
                      <ImageUpload
                        onFileSelect={handleFileSelect}
                        onCameraClick={startCamera}
                        fileInputRef={fileInputRef}
                      />
                    )}

                    {showCamera && (
                      <div className="glass-card p-6 mb-8">
                        <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg mb-4" />
                        <div className="flex gap-4 justify-center">
                          <button onClick={capturePhoto} className="btn-primary">
                            Capture Photo
                          </button>
                          <button
                            onClick={() => {
                              const stream = videoRef.current?.srcObject as MediaStream
                              stream?.getTracks().forEach((track) => track.stop())
                              setShowCamera(false)
                            }}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedImage && (
                      <div className="glass-card p-6 mb-8">
                        <img
                          src={selectedImage || "/placeholder.svg"}
                          alt="Selected food"
                          className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                        />
                        <button
                          onClick={() => {
                            setSelectedImage(null)
                            setCalorieData(null)
                            setAiSummary(null)
                            setHealthTips([])
                            setAnalysisMode("ai")
                            clearError()
                          }}
                          className="btn-secondary mt-4 mx-auto block"
                        >
                          Upload Different Image
                        </button>
                      </div>
                    )}

                    {(isUploading || isAnalyzing) && (
                      <LoadingSpinner message={isUploading ? "Uploading image..." : "Analyzing nutrition with AI..."} />
                    )}

                    {calorieData && (
                      <CalorieResults
                        items={calorieData}
                        aiSummary={aiSummary}
                        healthTips={healthTips}
                        isEstimated={analysisMode === "estimated"}
                      />
                    )}
                  </div>
                )}

                {activeTab === "history" && (
                  <HistoryDashboard
                    mealHistory={mealHistory}
                    onDeleteMeal={(id) => setMealHistory((prev) => prev.filter((meal) => meal.id !== id))}
                    onRecalculateMeal={(meal) => {
                      setSelectedImage(meal.imageUrl)
                      setCalorieData(meal.items)
                      setAiSummary(meal.aiSummary || null)
                      setHealthTips(meal.healthTips || [])
                      setActiveTab("upload")
                    }}
                  />
                )}

                {activeTab === "insights" && <InsightsDashboard mealHistory={mealHistory} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Voice Assistant */}
        <VoiceAssistant
          mealHistory={mealHistory}
          onCommand={handleVoiceCommand}
          isListening={isVoiceListening}
          toggleListening={() => setIsVoiceListening(!isVoiceListening)}
        />

        {/* Barcode Scanner Modal */}
        <AnimatePresence>
          {showBarcodeScanner && (
            <BarcodeScanner onClose={() => setShowBarcodeScanner(false)} onScanComplete={handleBarcodeScanComplete} />
          )}
        </AnimatePresence>

        <canvas ref={canvasRef} className="hidden" />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgba(0, 0, 0, 0.8)",
              color: "#fff",
              backdropFilter: "blur(10px)",
            },
          }}
        />
      </div>
    </ErrorBoundary>
  )
}
