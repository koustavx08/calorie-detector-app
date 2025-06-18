"use client"

import type React from "react"
import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo)
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-md w-full text-center">
            <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-white/80 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left mb-6 bg-black/20 p-4 rounded-lg">
                <summary className="text-white/70 cursor-pointer mb-2">Error Details</summary>
                <pre className="text-xs text-red-300 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-4 justify-center">
              <button onClick={this.handleReset} className="btn-primary flex items-center gap-2">
                <RefreshCw size={16} />
                Try Again
              </button>
              <button onClick={() => window.location.reload()} className="btn-secondary">
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
