// Mock database for barcode scanning
export const mockBarcodeDatabase: Record<
  string,
  {
    name: string
    calories: number
    protein: number
    carbs: number
    fats: number
  }
> = {
  "123456789": {
    name: "Protein Bar",
    calories: 220,
    protein: 20,
    carbs: 25,
    fats: 8,
  },
  "987654321": {
    name: "Greek Yogurt",
    calories: 120,
    protein: 15,
    carbs: 8,
    fats: 3,
  },
  "456789123": {
    name: "Granola",
    calories: 280,
    protein: 6,
    carbs: 45,
    fats: 12,
  },
  "789123456": {
    name: "Almond Milk",
    calories: 60,
    protein: 2,
    carbs: 8,
    fats: 3,
  },
  "321654987": {
    name: "Chicken Breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
  },
  default: {
    name: "Packaged Food Item",
    calories: 200,
    protein: 10,
    carbs: 25,
    fats: 7,
  },
}
