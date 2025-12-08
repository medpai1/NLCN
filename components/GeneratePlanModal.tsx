'use client'

import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { usePlanner, MealType } from '@/components/PlannerProvider'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { mealPlanAPI } from '@/lib/mealPlans'

interface Recipe {
  Name: string
  Calories: number
  CookTime?: string
  PrepTime?: string
  TotalTime?: string
  image_link?: string
}

interface GeneratePlanModalProps {
  date: string
  onClose: () => void
}

export default function GeneratePlanModal({ date, onClose }: GeneratePlanModalProps) {
  const { plans, refreshPlans } = usePlanner()
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMeals, setSelectedMeals] = useState<Partial<Record<MealType, Recipe | null>>>({
    breakfast: null,
    lunch: null,
    dinner: null,
    snack1: null,
    snack2: null,
  })

  // Load existing plan if any
  useEffect(() => {
    const existing = plans[date]
    if (existing?.meals) {
      const current: Partial<Record<MealType, Recipe | null>> = {}
      Object.entries(existing.meals).forEach(([k, v]: [string, any]) => {
        if (v) current[k as MealType] = v
      })
      setSelectedMeals(current)
    }
  }, [date, plans])

  const searchRecipes = async () => {
    if (!searchTerm.trim()) {
      setRecipes([])
      return
    }
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('q', searchTerm)
      params.set('pageSize', '20')
      const res = await fetch(`/api/recipes?${params.toString()}`)
      const data = await res.json()
      if (data.items) {
        setRecipes(data.items)
      }
    } catch (err) {
      console.error('Failed to search recipes', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchRecipes()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleSelectRecipe = (meal: MealType, recipe: Recipe) => {
    setSelectedMeals(prev => ({ ...prev, [meal]: recipe }))
  }

  const handleSave = async () => {
    if (!user) {
      alert('You must be logged in to save meal plans. Please log in and try again.')
      router.push('/login')
      return
    }

    // Check if token exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('plateplan.token') : null
    if (!token) {
      alert('No authentication token found. Please log in again.')
      router.push('/login')
      return
    }

    try {
      // Collect all meals to save in one API call
      const mealsToSave: Record<string, { Name: string; Calories: number; image_link?: string }> = {}
      for (const [meal, recipe] of Object.entries(selectedMeals)) {
        if (recipe) {
          mealsToSave[meal] = { Name: recipe.Name, Calories: recipe.Calories, image_link: recipe.image_link }
        }
      }

      // If there are meals to save, save them all at once
      if (Object.keys(mealsToSave).length > 0) {
        // Get existing plan meals
        const existingPlan = plans[date]
        const allMeals = {
          ...(existingPlan?.meals || {}),
          ...mealsToSave
        } as Record<string, { Name: string; Calories: number; image_link?: string }>

        console.log('Saving meal plan:', { date, meals: allMeals })
        
        // Save all meals in one API call
        const savedPlan = await mealPlanAPI.createOrUpdateMealPlan(date, allMeals)
        if(!savedPlan){
          alert('Failed to save meal plan. Please try again.')
          return
        }
        console.log('Meal plan saved successfully:', savedPlan)
        
        // Refresh plans to update local state
        await refreshPlans()
      } else {
        alert('Please select at least one recipe to save.')
        return
      }
      
      onClose()
    } catch (error: any) {
      const errorStatus = error?.response?.status
      const errorData = error?.response?.data
      const errorMessage = errorData?.detail || error.message || 'Failed to save meal plan. Please try again.'
      
      // Check if it's actually an authentication error
      if (errorStatus === 401 || errorMessage.includes('Could not validate credentials') || errorMessage.includes('session has expired')) {
        // Clear the invalid token and redirect to login
        const { authAPI } = await import('@/lib/auth')
        authAPI.logout()
        alert('Your session has expired. Please log in again.')
        router.push('/login')
      } else if (errorStatus === 403) {
        alert('You do not have permission to perform this action.')
      } else if (errorStatus === 404) {
        alert('The requested resource was not found.')
      } else if (errorStatus === 500) {
        alert('Server error. Please try again later.')
      } else {
        // Show the actual error message
        alert(`Failed to save meal plan: ${errorMessage}`)
      }
    }
  }

  const mealLabels: Record<MealType, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack1: 'Morning Snack',
    snack2: 'Afternoon Snack',
    snack: 'Snack',
  }

  const mealOrder: MealType[] = ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Plan Meals for {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
            <p className="text-sm text-gray-600 mt-1">Search and select recipes for each meal</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          {/* Meal Selection */}
          <div className="space-y-6">
            {mealOrder.map((meal) => (
              <div key={meal} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{mealLabels[meal]}</h3>
                  {selectedMeals[meal] && (
                    <button
                      onClick={() => handleSelectRecipe(meal, null as any)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {selectedMeals[meal] ? (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{selectedMeals[meal]!.Name}</div>
                      <div className="text-sm text-gray-600">{selectedMeals[meal]!.Calories} calories</div>
                    </div>
                    <button
                      onClick={() => setSearchTerm(selectedMeals[meal]!.Name)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No recipe selected</div>
                )}
              </div>
            ))}
          </div>

          {/* Recipe Results */}
          {searchTerm && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Search Results</h3>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {recipes.map((recipe, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        const meal = mealOrder.find(m => !selectedMeals[m]) || 'breakfast'
                        handleSelectRecipe(meal, recipe)
                        setSearchTerm('')
                      }}
                      className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
                    >
                      <div className="font-medium text-gray-900 text-sm line-clamp-1">{recipe.Name}</div>
                      <div className="text-xs text-gray-600 mt-1">{recipe.Calories} cal</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No recipes found</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save Plan
          </button>
        </div>
      </div>
    </div>
  )
}



