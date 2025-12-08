import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface NutritionInput {
  calories: number
  fatContent: number
  saturatedFatContent: number
  cholesterolContent: number
  sodiumContent: number
  carbohydrateContent: number
  fiberContent: number
  sugarContent: number
  proteinContent: number
}

export interface Recipe {
  Name: string
  CookTime: string
  PrepTime: string
  TotalTime: string
  RecipeIngredientParts: string[]
  Calories: number
  FatContent: number
  SaturatedFatContent: number
  CholesterolContent: number
  SodiumContent: number
  CarbohydrateContent: number
  FiberContent: number
  SugarContent: number
  ProteinContent: number
  RecipeInstructions: string[]
  image_link?: string
}

export interface RecommendationRequest {
  nutrition_input: number[]
  ingredients: string[]
  params: {
    n_neighbors: number
    return_distance: boolean
  }
}

export interface RecommendationResponse {
  output: Recipe[] | null
}

class DietRecommendationAPI {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  async getRecommendations(request: RecommendationRequest): Promise<Recipe[]> {
    try {
      const response = await this.api.post<RecommendationResponse>('/predict/', request)
      
      if (!response.data.output) {
        throw new Error('No recommendations found')
      }

      // Add image links to recipes
      const recipesWithImages = await Promise.all(
        response.data.output.map(async (recipe) => {
          try {
            const imageLink = await this.getRecipeImage(recipe.Name)
            return { ...recipe, image_link: imageLink }
          } catch (error) {
            console.warn(`Failed to get image for recipe: ${recipe.Name}`)
            return { ...recipe, image_link: 'https://via.placeholder.com/400x300?text=Recipe+Image' }
          }
        })
      )

      return recipesWithImages
    } catch (error) {
      console.error('API Error:', error)
      throw new Error('Failed to fetch recommendations')
    }
  }

  private async getRecipeImage(recipeName: string): Promise<string> {
    // This would integrate with your ImageFinder service
    // For now, we'll use Unsplash as a fallback
    try {
      const searchTerm = encodeURIComponent(recipeName)
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${searchTerm}&per_page=1&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          return data.results[0].urls.small
        }
      }
    } catch (error) {
      console.warn('Failed to fetch image from Unsplash:', error)
    }

    // Fallback to placeholder
    return 'https://via.placeholder.com/400x300?text=Recipe+Image'
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/')
      return response.data.health_check === 'OK'
    } catch (error) {
      return false
    }
  }
}

export const dietAPI = new DietRecommendationAPI()



