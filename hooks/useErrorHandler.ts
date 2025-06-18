"use client"

import { useState, useCallback } from "react"
import toast from "react-hot-toast"

interface ErrorState {
  message: string
  code?: string
  timestamp: number
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null)

  const handleError = useCallback((error: Error, context?: string) => {
    const errorMessage = context ? `${context}: ${error.message}` : error.message

    const errorState: ErrorState = {
      message: errorMessage,
      code: (error as any).code,
      timestamp: Date.now(),
    }

    setError(errorState)

    // Show toast notification
    toast.error(errorMessage, {
      duration: 5000,
      id: `error-${errorState.timestamp}`,
    })

    // Log error for debugging
    console.error("Application error:", {
      error,
      context,
      timestamp: new Date().toISOString(),
    })
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const retryLastAction = useCallback(
    (action: () => void) => {
      clearError()
      try {
        action()
      } catch (error) {
        handleError(error as Error, "Retry failed")
      }
    },
    [clearError, handleError],
  )

  return {
    error,
    handleError,
    clearError,
    retryLastAction,
  }
}
