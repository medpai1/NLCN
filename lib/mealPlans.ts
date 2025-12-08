import axios from 'axios'
import { authAPI } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

export interface PlannedRecipe {
  Name: string
  Calories: number
  image_link?: string
}

export interface MealPlan {
  id: number
  user_id: number
  date: string
  meals: Record<string, PlannedRecipe>
  created_at: string
  updated_at: string
}

class MealPlanAPI {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  constructor() {
    // Add request interceptor to include auth token in all requests
    this.api.interceptors.request.use(
      (config) => {
        // Get token directly from localStorage to ensure we have the latest value
        const token = typeof window !== 'undefined' ? localStorage.getItem('plateplan.token') : null
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('MealPlanAPI: Token added to request headers', {
            url: config.url,
            hasToken: !!token,
            tokenLength: token.length,
            authHeader: config.headers.Authorization?.substring(0, 20) + '...'
          })
        } else {
          console.warn('MealPlanAPI: No token found in localStorage for request', config.url)
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  private getAuthHeaders(): Record<string, string> {
    return authAPI.getAuthHeaders()
  }

  async getMealPlans(startDate?: string, endDate?: string): Promise<MealPlan[]> {
    try {
      // Check if token exists
      const token = typeof window !== 'undefined' ? localStorage.getItem('plateplan.token') : null
      if (!token) {
        return []
      }

      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      
      const response = await this.api.get<MealPlan[]>(
        `/meal-plans?${params.toString()}`
      )
      return response.data
    } catch (error: any) {
      // If it's a 401, the token is invalid but don't clear it automatically
      // Let the user continue using the app - they can log out manually if needed
      // Just return empty array so the app doesn't crash
      return []
    }
  }

  async getMealPlan(date: string): Promise<MealPlan | null> {
    try {
      const response = await this.api.get<MealPlan>(
        `/meal-plans/${date}`
      )
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw new Error(error.response?.data?.detail || 'Failed to fetch meal plan')
    }
  }

  async createOrUpdateMealPlan(date: string, meals: Record<string, PlannedRecipe>): Promise<MealPlan> {
    try {
      // Ensure we have a valid token before making the request
      const token = typeof window !== 'undefined' ? localStorage.getItem('plateplan.token') : null
      console.log('createOrUpdateMealPlan: Token check', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        date,
        mealsCount: Object.keys(meals).length
      })
      
      if (!token) {
        throw new Error('You must be logged in to save meal plans')
      }
      
      // The interceptor should add the token, but let's also explicitly set it here
      const response = await this.api.post<MealPlan>(
        '/meal-plans',
        { date, meals },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      console.log('createOrUpdateMealPlan: Success', response.data)
      return response.data
    } catch (error: any) {
      console.error('createOrUpdateMealPlan: Error', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      // If it's an authentication error, provide a clearer message
      if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log out and log in again.')
      }
      
      // Re-throw the error with more details
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save meal plan'
      throw new Error(errorMessage)
    }
  }

  async updateMealPlan(date: string, meals: Record<string, PlannedRecipe>): Promise<MealPlan> {
    try {
      const response = await this.api.put<MealPlan>(
        `/meal-plans/${date}`,
        { meals }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update meal plan')
    }
  }

  async deleteMealPlan(date: string): Promise<void> {
    try {
      await this.api.delete(`/meal-plans/${date}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete meal plan')
    }
  }

  async removeMealFromPlan(date: string, mealType: string): Promise<MealPlan> {
    try {
      const response = await this.api.delete<MealPlan>(
        `/meal-plans/${date}/meals/${mealType}`
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to remove meal')
    }
  }
}

export const mealPlanAPI = new MealPlanAPI()

