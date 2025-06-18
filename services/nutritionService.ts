import type { CalorieItem } from "@/types"

class NutritionService {
  private readonly IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY
  private readonly USDA_API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY
  private readonly OPENFOODFACTS_BASE_URL = "https://world.openfoodfacts.org/api/"
  private readonly USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1"

  async uploadImage(file: File): Promise<string> {
    // Validate file
    if (!file) {
      throw new Error("No file provided")
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      throw new Error("File size too large (max 10MB)")
    }

    const formData = new FormData()
    formData.append("image", file)

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${this.IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("ImgBB upload error:", errorText)
        throw new Error(`Image upload failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success || !data.data?.url) {
        throw new Error("Invalid response from image upload service")
      }

      return data.data.url
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to upload image")
    }
  }

  async getNutritionByBarcode(barcode: string): Promise<CalorieItem | null> {
    try {
      // Try OpenFoodFacts first (free and comprehensive)
      const openFoodFactsData = await this.getFromOpenFoodFacts(barcode)
      if (openFoodFactsData) {
        return openFoodFactsData
      }

      // Fallback to USDA if available
      const usdaData = await this.getFromUSDA(barcode)
      if (usdaData) {
        return usdaData
      }

      throw new Error("Product not found in any database")
    } catch (error) {
      console.error("Error fetching nutrition data:", error)
      throw error
    }
  }

  private async getFromOpenFoodFacts(barcode: string): Promise<CalorieItem | null> {
    try {
      const response = await fetch(`${this.OPENFOODFACTS_BASE_URL}/product/${barcode}.json`)

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      if (data.status === 0 || !data.product) {
        return null
      }

      const product = data.product
      const nutriments = product.nutriments || {}

      return {
        item_name: product.product_name || product.generic_name || "Unknown Product",
        total_calories: Math.round(nutriments.energy_kcal_100g || nutriments["energy-kcal_100g"] || 0),
        total_protien: Math.round(nutriments.proteins_100g || nutriments["proteins_100g"] || 0),
        toal_carbs: Math.round(nutriments.carbohydrates_100g || nutriments["carbohydrates_100g"] || 0),
        toal_fats: Math.round(nutriments.fat_100g || nutriments["fat_100g"] || 0),
      }
    } catch (error) {
      console.error("OpenFoodFacts API error:", error)
      return null
    }
  }

  private async getFromUSDA(barcode: string): Promise<CalorieItem | null> {
    try {
      // USDA FoodData Central doesn't directly support barcode lookup
      // This is a placeholder for potential USDA integration
      // In a real implementation, you might need to search by product name
      // or use a different approach

      const searchResponse = await fetch(
        `${this.USDA_BASE_URL}/foods/search?query=${barcode}&api_key=${this.USDA_API_KEY}&pageSize=1`,
      )

      if (!searchResponse.ok) {
        return null
      }

      const searchData = await searchResponse.json()

      if (!searchData.foods || searchData.foods.length === 0) {
        return null
      }

      const food = searchData.foods[0]
      const nutrients = food.foodNutrients || []

      // Extract key nutrients
      const calories = this.findNutrient(nutrients, "Energy") || 0
      const protein = this.findNutrient(nutrients, "Protein") || 0
      const carbs = this.findNutrient(nutrients, "Carbohydrate, by difference") || 0
      const fats = this.findNutrient(nutrients, "Total lipid (fat)") || 0

      return {
        item_name: food.description || "USDA Food Item",
        total_calories: Math.round(calories),
        total_protien: Math.round(protein),
        toal_carbs: Math.round(carbs),
        toal_fats: Math.round(fats),
      }
    } catch (error) {
      console.error("USDA API error:", error)
      return null
    }
  }

  private findNutrient(nutrients: any[], nutrientName: string): number {
    const nutrient = nutrients.find((n) => n.nutrientName?.toLowerCase().includes(nutrientName.toLowerCase()))
    return nutrient?.value || 0
  }

  async searchFoodByName(name: string): Promise<CalorieItem[]> {
    try {
      const response = await fetch(
        `${this.USDA_BASE_URL}/foods/search?query=${encodeURIComponent(name)}&api_key=${this.USDA_API_KEY}&pageSize=5`,
      )

      if (!response.ok) {
        throw new Error("Failed to search foods")
      }

      const data = await response.json()

      return (
        data.foods?.map((food: any) => {
          const nutrients = food.foodNutrients || []
          const calories = this.findNutrient(nutrients, "Energy") || 0
          const protein = this.findNutrient(nutrients, "Protein") || 0
          const carbs = this.findNutrient(nutrients, "Carbohydrate") || 0
          const fats = this.findNutrient(nutrients, "Total lipid") || 0

          return {
            item_name: food.description || "Food Item",
            total_calories: Math.round(calories),
            total_protien: Math.round(protein),
            toal_carbs: Math.round(carbs),
            toal_fats: Math.round(fats),
          }
        }) || []
      )
    } catch (error) {
      console.error("Error searching foods:", error)
      return []
    }
  }
}

export const nutritionService = new NutritionService()
