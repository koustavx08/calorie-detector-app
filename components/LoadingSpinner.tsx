"use client"

interface LoadingSpinnerProps {
  message: string
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="glass-card p-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animation-delay-150"></div>
        </div>

        <p className="text-white font-medium text-lg">{message}</p>

        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></div>
        </div>
      </div>
    </div>
  )
}
