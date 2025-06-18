"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Barcode, X, RotateCcw, Zap } from "lucide-react"
import toast from "react-hot-toast"

interface BarcodeScannerProps {
  onClose: () => void
  onScanComplete: (barcode: string) => void
}

export default function BarcodeScanner({ onClose, onScanComplete }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    startScanner()
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }

  const startScanner = async () => {
    try {
      setError(null)
      setDetectedBarcode(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setScanning(true)

        // Start barcode detection simulation
        // In a real implementation, you would use a library like QuaggaJS or ZXing
        scanIntervalRef.current = setInterval(() => {
          if (Math.random() > 0.85) {
            // 15% chance to "detect" a barcode
            const mockBarcodes = [
              "0123456789012", // EAN-13
              "012345678905", // UPC-A
              "1234567890123",
              "9876543210987",
              "5901234123457",
            ]
            const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)]
            handleBarcodeScan(randomBarcode)
          }
        }, 2000)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError("Unable to access camera. Please ensure you've granted camera permissions.")
      setScanning(false)
      toast.error("Camera access failed")
    }
  }

  const handleBarcodeScan = (barcode: string) => {
    setScanning(false)
    setDetectedBarcode(barcode)

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }

    toast.success(`Barcode detected: ${barcode}`)

    // Delay to show the detected barcode
    setTimeout(() => {
      onScanComplete(barcode)
    }, 1500)
  }

  const resetScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    setDetectedBarcode(null)
    startScanner()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-lg mx-4"
      >
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-[70vh] object-cover" />

            {scanning && !detectedBarcode && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-green-400 rounded-lg relative">
                  <motion.div
                    animate={{
                      y: [0, 230, 0],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 3,
                      ease: "easeInOut",
                    }}
                    className="absolute left-0 right-0 h-0.5 bg-green-400 shadow-lg shadow-green-400/50"
                  />
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-400" />
                </div>
              </div>
            )}

            {detectedBarcode && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center p-6"
                >
                  <Zap className="mx-auto text-green-400 mb-4" size={48} />
                  <p className="text-green-400 text-lg font-bold mb-2">Barcode Detected!</p>
                  <p className="text-white font-mono text-sm">{detectedBarcode}</p>
                  <p className="text-white/70 text-sm mt-2">Fetching nutrition data...</p>
                </motion.div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center p-6">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button onClick={startScanner} className="btn-primary">
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Barcode className="text-white" size={24} />
              <span className="text-white font-medium">
                {scanning ? "Scanning..." : detectedBarcode ? "Processing..." : "Ready to scan"}
              </span>
            </div>

            <div className="flex gap-2">
              {!detectedBarcode && (
                <button
                  onClick={resetScanner}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Reset scanner"
                  disabled={!scanning}
                >
                  <RotateCcw size={20} className="text-white" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close scanner"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>

          <div className="px-4 pb-4">
            <p className="text-white/60 text-xs text-center">
              Position the barcode within the scanning area. Make sure it's well-lit and clearly visible.
            </p>
          </div>
        </div>
      </motion.div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
