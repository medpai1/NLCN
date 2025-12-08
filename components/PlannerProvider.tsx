'use client'

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useAuth } from './AuthProvider'
import { mealPlanAPI, MealPlan as APIMealPlan } from '@/lib/mealPlans'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack1' | 'snack2' | 'snack'

export interface PlannedRecipe {
  Name: string
  Calories: number
  image_link?: string
}

export interface DayPlan {
  date: string
  meals: Partial<Record<MealType, PlannedRecipe>>
}

interface PlannerContextValue {
  plans: Record<string, DayPlan>
  loading: boolean
  addToPlan: (date: string, meal: MealType, recipe: PlannedRecipe) => Promise<void>
  removeFromPlan: (date: string, meal: MealType) => Promise<void>
  refreshPlans: (startDate?: string, endDate?: string) => Promise<void>
}

const PlannerContext = createContext<PlannerContextValue | undefined>(undefined)

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<Record<string, DayPlan>>({})
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Convert API meal plan to DayPlan
  const apiPlanToDayPlan = (apiPlan: APIMealPlan): DayPlan => {
    return {
      date: apiPlan.date,
      meals: apiPlan.meals as Partial<Record<MealType, PlannedRecipe>>
    }
  }

  // Load meal plans from API
  const refreshPlans = useCallback(async (startDate?: string, endDate?: string) => {
    if (!user) {
      setPlans({})
      return
    }

    // Check if token exists before making request
    const token = typeof window !== 'undefined' ? localStorage.getItem('plateplan.token') : null
    if (!token) {
      setPlans({})
      return
    }

    setLoading(true)
    try {
      const apiPlans = await mealPlanAPI.getMealPlans(startDate, endDate)
      const plansMap: Record<string, DayPlan> = {}
      apiPlans.forEach(plan => {
        plansMap[plan.date] = apiPlanToDayPlan(plan)
      })
      setPlans(plansMap)
    } catch (error: any) {
      // Silently handle 401 errors - token might be expired or invalid
      if (error?.response?.status === 401 || error?.message?.includes('Could not validate credentials')) {
        // Don't clear token here - let the user try to use the app
        // The token might be valid but there could be a timing issue
        setPlans({})
      } else {
        console.error('Failed to load meal plans:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Don't auto-load plans on login - let pages call refreshPlans when needed
  // This prevents 401 errors right after login
  useEffect(() => {
    if (!user) {
      setPlans({})
    }
    // Only auto-load if we're on a page that needs it
    // Pages can call refreshPlans() manually when needed
  }, [user])

  const addToPlan = async (date: string, meal: MealType, recipe: PlannedRecipe) => {
    if (!user) {
      throw new Error('You must be logged in to add meals to your plan')
    }

    try {
      // Get existing plan or create new one
      const existingPlan = plans[date]
      const updatedMeals = {
        ...(existingPlan?.meals || {}),
        [meal]: recipe
      } as Record<string, PlannedRecipe>

      // Update in API
      await mealPlanAPI.createOrUpdateMealPlan(date, updatedMeals)

      // Update local state
      setPlans(prev => {
        const day = prev[date] || { date, meals: {} }
        return {
          ...prev,
          [date]: {
            ...day,
            meals: { ...day.meals, [meal]: recipe }
          }
        }
      })
    } catch (error) {
      console.error('Failed to add meal to plan:', error)
      throw error
    }
  }

  const removeFromPlan = async (date: string, meal: MealType) => {
    if (!user) {
      throw new Error('You must be logged in to remove meals from your plan')
    }

    try {
      // Remove from API
      await mealPlanAPI.removeMealFromPlan(date, meal)

      // Update local state
      setPlans(prev => {
        const day = prev[date]
        if (!day) return prev
        const { [meal]: _omit, ...rest } = day.meals
        return { ...prev, [date]: { ...day, meals: rest } }
      })
    } catch (error) {
      console.error('Failed to remove meal from plan:', error)
      throw error
    }
  }

  const value = useMemo(
    () => ({ plans, loading, addToPlan, removeFromPlan, refreshPlans }),
    [plans, loading, refreshPlans]
  )

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
}

export function usePlanner() {
  const ctx = useContext(PlannerContext)
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider')
  return ctx
}



