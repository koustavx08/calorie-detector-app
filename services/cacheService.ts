import type { CalorieItem, MealEntry } from "@/types"

interface CachedAnalysis {
  items: CalorieItem[]
  aiSummary?: string
  healthTips?: string[]
  timestamp: number
}

class CacheService {
  private readonly CACHE_PREFIX = "calorie-detector"
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

  async cacheMealEntry(meal: MealEntry): Promise<void> {
    try {
      const key = `${this.CACHE_PREFIX}-meal-${meal.id}`
      localStorage.setItem(key, JSON.stringify(meal))
    } catch (error) {
      console.error("Failed to cache meal entry:", error)
    }
  }

  async getCachedAnalysis(file: File): Promise<CachedAnalysis | null> {
    try {
      // Create a simple hash of the file for caching
      const fileHash = await this.createFileHash(file)
      const key = `${this.CACHE_PREFIX}-analysis-${fileHash}`

      const cached = localStorage.getItem(key)
      if (!cached) return null

      const analysis: CachedAnalysis = JSON.parse(cached)

      // Check if cache is expired
      if (Date.now() - analysis.timestamp > this.CACHE_EXPIRY) {
        localStorage.removeItem(key)
        return null
      }

      return analysis
    } catch (error) {
      console.error("Failed to get cached analysis:", error)
      return null
    }
  }

  async cacheAnalysis(file: File, analysis: CachedAnalysis): Promise<void> {
    try {
      const fileHash = await this.createFileHash(file)
      const key = `${this.CACHE_PREFIX}-analysis-${fileHash}`

      const cacheData = {
        ...analysis,
        timestamp: Date.now(),
      }

      localStorage.setItem(key, JSON.stringify(cacheData))
    } catch (error) {
      console.error("Failed to cache analysis:", error)
    }
  }

  private async createFileHash(file: File): Promise<string> {
    // Simple hash based on file size and name
    return `${file.name}-${file.size}-${file.lastModified}`
  }

  clearExpiredCache(): void {
    try {
      const keys = Object.keys(localStorage)
      const now = Date.now()

      keys.forEach((key) => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "{}")
            if (data.timestamp && now - data.timestamp > this.CACHE_EXPIRY) {
              localStorage.removeItem(key)
            }
          } catch {
            // Remove invalid cache entries
            localStorage.removeItem(key)
          }
        }
      })
    } catch (error) {
      console.error("Failed to clear expired cache:", error)
    }
  }

  getCacheSize(): number {
    try {
      let size = 0
      const keys = Object.keys(localStorage)

      keys.forEach((key) => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          size += localStorage.getItem(key)?.length || 0
        }
      })

      return size
    } catch {
      return 0
    }
  }
}

export const cacheService = new CacheService()
