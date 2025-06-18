"use client"

import { useState, useEffect } from "react"

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true)

  useEffect(() => {
    // Set initial state
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true)

    // Event listeners for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return isOnline
}
