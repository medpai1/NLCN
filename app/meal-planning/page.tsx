'use client'

import { useMemo, useState, useEffect } from 'react'
import { Calendar, Plus, Clock, Users, Target, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePlanner } from '@/components/PlannerProvider'
import { useAuth } from '@/components/AuthProvider'
import GeneratePlanModal from '@/components/GeneratePlanModal'
import { useRouter } from 'next/navigation'

interface MealPlan {
  id: string
  date: string
  meals: {
    breakfast?: string
    lunch?: string
    dinner?: string
    snack?: string
  }
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export default function MealPlanning() {
  const { plans, removeFromPlan, refreshPlans, loading: plansLoading } = usePlanner()
  const { user } = useAuth()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Refresh plans when view changes or when user is set
  useEffect(() => {
    if (!user) return
    
    // Load plans directly without token verification
    // The API will handle authentication errors
    if (viewMode === 'month') {
      const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
      refreshPlans(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      )
    } else if (viewMode === 'week') {
      const weekStart = getWeekStart(new Date(selectedDate))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      refreshPlans(
        weekStart.toISOString().split('T')[0],
        weekEnd.toISOString().split('T')[0]
      )
    }
  }, [user, viewMode, currentMonth, selectedDate, refreshPlans])

  const mealPlans = useMemo(() => {
    // transform plans record to array with totals
    return Object.values(plans).map(p => {
      const totals = Object.values(p.meals || {}).reduce((acc, r: any) => {
        acc.cal += Number(r?.Calories || 0)
        return acc
      }, { cal: 0 })
      return {
        id: p.date,
        date: p.date,
        meals: Object.fromEntries(Object.entries(p.meals || {}).map(([k, v]: any) => [k, v?.Name || ''])) as any,
        totalCalories: Math.round(totals.cal),
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      } as MealPlan
    })
  }, [plans])

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return d
  }

  const getWeekDates = (date: string) => {
    const startDate = getWeekStart(new Date(date))
    const week = []
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      week.push(currentDate.toISOString().split('T')[0])
    }
    return week
  }

  const getMonthDates = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay()
    
    // Start from the Sunday of the week containing the first day
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDayOfWeek)
    
    const dates: (string | null)[] = []
    const current = new Date(startDate)
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const currentMonthNum = current.getMonth()
      if (currentMonthNum === month) {
        dates.push(current.toISOString().split('T')[0])
      } else {
        dates.push(null)
      }
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  const weekDates = getWeekDates(selectedDate)
  const monthDates = getMonthDates()
  const currentPlan = mealPlans.find(plan => plan.date === selectedDate)
  const hasMeals = currentPlan && Object.keys(currentPlan.meals).length > 0 && Object.values(currentPlan.meals).some(v => v && v.trim() !== '')

  const getDayName = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
  }

  const getDayNumber = (date: string) => {
    return new Date(date).getDate()
  }

  const getMealCount = (date: string) => {
    const plan = mealPlans.find(p => p.date === date)
    if (!plan) return 0
    return Object.values(plan.meals).filter(v => v && v.trim() !== '').length
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Planning</h1>
            <p className="text-gray-600">Plan your meals and track your nutrition goals</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'week' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'month' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Month View
            </button>
          </div>
        </div>

        {viewMode === 'week' ? (
          <>
            {/* Week View */}
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Weekly Meal Plan</h2>
                <div className="flex items-center space-x-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-field"
                  />
                  <button onClick={() => setShowGenerateModal(true)} className="btn-primary inline-flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Plan
                  </button>
                </div>
              </div>

              {/* Week Calendar */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {weekDates.map((date, index) => (
                  <div
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      date === selectedDate
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="text-sm font-medium">{getDayName(date)}</div>
                    <div className="text-lg font-bold">{getDayNumber(date)}</div>
                    {getMealCount(date) > 0 && (
                      <div className="text-xs mt-1 opacity-75">{getMealCount(date)} meals</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Meal Plan for Selected Day */}
              <div className="lg:col-span-2">
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <button onClick={() => setShowGenerateModal(true)} className="btn-secondary">
                      Edit Plan
                    </button>
                  </div>

                  {hasMeals ? (
                    <div className="space-y-4">
                      {Object.entries(currentPlan!.meals).filter(([_, v]) => v && v.trim() !== '').map(([mealType, mealName]) => (
                        <div key={mealType} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-primary-600 rounded-full mr-3"></div>
                            <div>
                              <div className="font-medium text-gray-900 capitalize">{mealType}</div>
                              <div className="text-sm text-gray-600">{mealName}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Link 
                              href={`/recipes`}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              View
                            </Link>
                            <button className="text-red-600 hover:text-red-700 text-sm" onClick={()=> removeFromPlan(selectedDate, mealType as any)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No meal plan for this day</h3>
                      <p className="text-gray-600 mb-4">Create a meal plan to get started</p>
                      <button onClick={() => setShowGenerateModal(true)} className="btn-primary inline-flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Plan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Nutrition Summary */}
              <div className="space-y-6">
                {currentPlan && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Nutrition</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Calories</span>
                        <span className="font-medium text-gray-900">{currentPlan.totalCalories}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Protein</span>
                        <span className="font-medium text-gray-900">{currentPlan.totalProtein}g</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Carbs</span>
                        <span className="font-medium text-gray-900">{currentPlan.totalCarbs}g</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fat</span>
                        <span className="font-medium text-gray-900">{currentPlan.totalFat}g</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href="/recipes" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      Browse Recipes
                    </Link>
                    <Link href="/diet-recommendation" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      Get Recommendations
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Month View */}
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <button onClick={() => setShowGenerateModal(true)} className="btn-primary inline-flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Meal
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {monthDates.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="p-2 min-h-[80px]"></div>
                  }
                  
                  const plan = mealPlans.find(p => p.date === date)
                  const mealCount = getMealCount(date)
                  const isToday = date === new Date().toISOString().split('T')[0]
                  const isSelected = date === selectedDate
                  
                  return (
                    <div
                      key={date}
                      onClick={() => {
                        setSelectedDate(date)
                        setViewMode('week')
                      }}
                      className={`p-2 min-h-[80px] border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-100 border-primary-500'
                          : isToday
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {new Date(date).getDate()}
                      </div>
                      {mealCount > 0 && (
                        <div className="space-y-1">
                          {Object.entries(plan?.meals || {}).slice(0, 2).map(([mealType, mealName]: [string, any]) => (
                            mealName && (
                              <div key={mealType} className="text-xs bg-primary-100 text-primary-800 px-1 py-0.5 rounded truncate">
                                {mealName}
                              </div>
                            )
                          ))}
                          {mealCount > 2 && (
                            <div className="text-xs text-gray-500">+{mealCount - 2} more</div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
      {showGenerateModal && (
        <GeneratePlanModal
          date={selectedDate}
          onClose={() => setShowGenerateModal(false)}
        />
      )}
    </div>
  )
}
