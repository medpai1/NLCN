'use client'

import { useState } from 'react'
import { Utensils, Calculator, Activity, Target } from 'lucide-react'
import Link from 'next/link'
import RecipeCard from '@/components/RecipeCard'
import { AddToPlanButton } from '@/components/AddToPlanButton'

interface PersonData {
  age: number
  height: number
  weight: number
  gender: 'Male' | 'Female'
  activity: string
  weightLossPlan: string
  numberOfMeals: number
  illness?: string
}

interface CaloriePlan {
  plan: string
  calories: number
  weightLoss: string
}

export default function DietRecommendation() {
  const [formData, setFormData] = useState<PersonData>({
    age: 25,
    height: 170,
    weight: 70,
    gender: 'Male',
    activity: 'Moderate exercise (3-5 days/wk)',
    weightLossPlan: 'Maintain weight',
    numberOfMeals: 3,
    illness: 'none'
  })

  const [results, setResults] = useState<{
    bmi: number
    bmiCategory: string
    bmiColor: string
    bmr: number
    caloriePlans: CaloriePlan[]
    mealCalories: Record<string, number>
  } | null>(null)

  const [recommendedRecipes, setRecommendedRecipes] = useState<any[]>([])
  const [groupedRecommendations, setGroupedRecommendations] = useState<Record<string, any[]>>({})
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false)

  const activityLevels = [
    'Little/no exercise',
    'Light exercise',
    'Moderate exercise (3-5 days/wk)',
    'Very active (6-7 days/wk)',
    'Extra active (very active & physical job)'
  ]

  const weightLossPlans = [
    { name: 'Maintain weight', multiplier: 1, loss: '-0 kg/week' },
    { name: 'Mild weight loss', multiplier: 0.9, loss: '-0.25 kg/week' },
    { name: 'Weight loss', multiplier: 0.8, loss: '-0.5 kg/week' },
    { name: 'Extreme weight loss', multiplier: 0.6, loss: '-1 kg/week' }
  ]

  const illnessOptions = [
    { value: 'none', label: 'None' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'hypertension', label: 'Hypertension (High Blood Pressure)' },
    { value: 'heart_disease', label: 'Heart Disease' },
    { value: 'kidney_disease', label: 'Kidney Disease' },
    { value: 'celiac', label: 'Celiac Disease (Gluten-Free)' }
  ]

  const calculateBMI = (height: number, weight: number) => {
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    
    let category: string
    let color: string

    if (bmi < 18.5) {
      category = 'Underweight'
      color = 'text-red-600'
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Normal weight'
      color = 'text-green-600'
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight'
      color = 'text-yellow-600'
    } else {
      category = 'Obesity'
      color = 'text-red-600'
    }

    return { bmi: Math.round(bmi * 10) / 10, category, color }
  }

  const calculateBMR = (data: PersonData) => {
    if (data.gender === 'Male') {
      return 10 * data.weight + 6.25 * data.height - 5 * data.age + 5
    } else {
      return 10 * data.weight + 6.25 * data.height - 5 * data.age - 161
    }
  }

  const calculateCalories = (data: PersonData) => {
    const activityWeights = [1.2, 1.375, 1.55, 1.725, 1.9]
    const activityIndex = activityLevels.indexOf(data.activity)
    const weight = activityWeights[activityIndex]
    
    const bmr = calculateBMR(data)
    const maintainCalories = bmr * weight

    return weightLossPlans.map(plan => ({
      plan: plan.name,
      calories: Math.round(maintainCalories * plan.multiplier),
      weightLoss: plan.loss
    }))
  }

  const generateRecipeRecommendations = async () => {
    if (!results) return
    
    setIsGeneratingRecipes(true)
    try {
      // Get the target calories for the selected plan
      const selectedPlan = weightLossPlans.find(plan => plan.name === formData.weightLossPlan)
      const targetCalories = results.caloriePlans.find(plan => plan.plan === formData.weightLossPlan)?.calories || 2000
      
      // Adjust nutrition input based on illness
      let maxSugar = 20 // Default max sugar
      let maxCarbs = 100 // Default max carbs
      let maxSodium = 600 // Default max sodium
      let maxCholesterol = 50 // Default max cholesterol
      let maxProtein = 100 // Default max protein
      
      if (formData.illness === 'diabetes') {
        maxSugar = 10 // Lower sugar for diabetes
        maxCarbs = 60 // Lower carbs
      } else if (formData.illness === 'hypertension') {
        maxSodium = 300 // Lower sodium for hypertension
      } else if (formData.illness === 'heart_disease') {
        maxCholesterol = 30 // Lower cholesterol
        maxSodium = 400 // Lower sodium
      } else if (formData.illness === 'kidney_disease') {
        maxSodium = 200 // Very low sodium
        maxProtein = 50 // Lower protein
      }
      
      // Generate nutrition input based on target calories and illness constraints
      const nutritionInput = [
        targetCalories * 0.3, // Breakfast calories
        Math.random() * 20 + 10, // Fat content
        Math.random() * 4, // Saturated fat
        Math.min(Math.random() * 30, maxCholesterol), // Cholesterol
        Math.min(Math.random() * 400 + 200, maxSodium), // Sodium
        Math.min(Math.random() * 75 + 40, maxCarbs), // Carbs
        Math.random() * 10 + 4, // Fiber
        Math.min(Math.random() * 10, maxSugar), // Sugar
        Math.min(Math.random() * 70 + 30, maxProtein) // Protein
      ]

      // Call the FastAPI backend
      const requestData = {
        nutrition_input: nutritionInput,
        ingredients: [],
        params: {
          n_neighbors: 10,
          return_distance: false
        }
      }

      const response = await fetch('http://localhost:8081/predict/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations from backend')
      }

      const data = await response.json()
      
      if (data.output && data.output.length > 0) {
        // Filter recipes based on illness requirements
        let filteredRecipes = [...data.output]
        
        if (formData.illness === 'diabetes') {
          // Filter for low sugar and moderate carbs
          filteredRecipes = filteredRecipes.filter((r: any) => {
            const sugar = Number(r.SugarContent ?? r.sugar_content ?? 0)
            const carbs = Number(r.CarbohydrateContent ?? r.carbohydrate_content ?? 0)
            return sugar <= 15 && carbs <= 80
          })
        } else if (formData.illness === 'hypertension') {
          // Filter for low sodium
          filteredRecipes = filteredRecipes.filter((r: any) => {
            const sodium = Number(r.SodiumContent ?? r.sodium_content ?? 0)
            return sodium <= 500
          })
        } else if (formData.illness === 'heart_disease') {
          // Filter for low cholesterol and low sodium
          filteredRecipes = filteredRecipes.filter((r: any) => {
            const cholesterol = Number(r.CholesterolContent ?? r.cholesterol_content ?? 0)
            const sodium = Number(r.SodiumContent ?? r.sodium_content ?? 0)
            return cholesterol <= 50 && sodium <= 500
          })
        } else if (formData.illness === 'kidney_disease') {
          // Filter for very low sodium and moderate protein
          filteredRecipes = filteredRecipes.filter((r: any) => {
            const sodium = Number(r.SodiumContent ?? r.sodium_content ?? 0)
            const protein = Number(r.ProteinContent ?? r.protein_content ?? 0)
            return sodium <= 300 && protein <= 60
          })
        } else if (formData.illness === 'celiac') {
          // Filter for gluten-free (this would require ingredient checking, but for now we'll just note it)
          // In a real implementation, you'd check ingredients for gluten-containing items
        }
        
        // If filtering removed all recipes, use original list
        if (filteredRecipes.length === 0) {
          filteredRecipes = data.output
        }
        
        // Group recipes by meal slots using meal calorie targets
        const mealTargets = results.mealCalories // breakfast, lunch, dinner, snack...
        const grouped: Record<string, any[]> = {}
        Object.keys(mealTargets).forEach((k) => { grouped[k] = [] })

        // naive assign by closest calories to each meal target
        const remaining = [...filteredRecipes]
        const getCalories = (r: any) => Number(r.Calories ?? r.calories ?? 0)
        for (const meal of Object.keys(mealTargets)) {
          const target = mealTargets[meal]
          remaining.sort((a,b)=>Math.abs(getCalories(a)-target)-Math.abs(getCalories(b)-target))
          const take = Math.max(1, Math.floor(remaining.length / Object.keys(mealTargets).length))
          const chosen = await Promise.all(
            remaining.splice(0, take).map(async (recipe:any) => {
              try {
                const r = await fetch(`/api/recipe-image?name=${encodeURIComponent(recipe.Name || recipe.name || 'Recipe')}`)
                const j = await r.json()
                return { ...recipe, image_link: j.url }
              } catch {
                return { ...recipe, image_link: `/api/placeholder?width=400&height=300&text=${encodeURIComponent(recipe.Name || recipe.name || 'Recipe')}` }
              }
            })
          )
          grouped[meal] = chosen
        }

        // flatten grouped to list for current UI, but preserve ordering breakfast->...
        const orderedMeals = Object.keys(mealTargets)
        const flattened = orderedMeals.flatMap(meal => grouped[meal])
        setGroupedRecommendations(grouped)
        setRecommendedRecipes(flattened)
      } else {
        setRecommendedRecipes([])
        setGroupedRecommendations({})
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
      // Fallback to local API if backend is not available
      try {
        const params = new URLSearchParams()
        params.set('pageSize', '10')
        params.set('sort', 'calories-low')
        
        const response = await fetch(`/api/recipes?${params.toString()}`)
        const data = await response.json()
        
        if (data.items && data.items.length > 0) {
          const recipesWithImages = data.items.map((recipe: any) => ({
            ...recipe,
            image_link: `/api/placeholder/400/300?text=${encodeURIComponent(recipe.Name)}`
          }))
          setRecommendedRecipes(recipesWithImages)
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        setRecommendedRecipes([])
      }
    } finally {
      setIsGeneratingRecipes(false)
    }
  }
  
  const calculateMealCalories = (data: PersonData, totalCalories: number) => {
    const { numberOfMeals } = data;
    const mealRatios: Record<number, number[]> = {
      3: [0.3, 0.4, 0.3],        // breakfast, lunch, dinner
      4: [0.25, 0.35, 0.25, 0.15], // breakfast, lunch, dinner, snack
      5: [0.25, 0.3, 0.25, 0.1, 0.1] // breakfast, lunch, dinner, snacks
    };
  
    const ratios = mealRatios[numberOfMeals] || mealRatios[3];
    const mealNames = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2'];
  
    const result: Record<string, number> = {};
    ratios.forEach((ratio, index) => {
      result[mealNames[index]] = Math.round(totalCalories * ratio);
    });
  
    return result;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const bmiResult = calculateBMI(formData.height, formData.weight)
    const bmr = calculateBMR(formData)
    const caloriePlans = calculateCalories(formData)
    const mealCalories = calculateMealCalories(formData, caloriePlans[0].calories)

    setResults({
      bmi: bmiResult.bmi,
      bmiCategory: bmiResult.category,
      bmiColor: bmiResult.color,
      bmr: Math.round(bmr),
      caloriePlans,
      mealCalories
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4">
            <Utensils className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Diet Recommendation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get personalized meal recommendations based on your health profile and goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-2 card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Health Profile</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                    className="input-field"
                    min="2"
                    max="120"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as 'Male' | 'Female'})}
                    className="input-field"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: Number(e.target.value)})}
                    className="input-field"
                    min="50"
                    max="300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                    className="input-field"
                    min="10"
                    max="300"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Level
                </label>
                <select
                  value={formData.activity}
                  onChange={(e) => setFormData({...formData, activity: e.target.value})}
                  className="input-field"
                >
                  {activityLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Weight Loss Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight Loss Plan
                </label>
                <select
                  value={formData.weightLossPlan}
                  onChange={(e) => setFormData({...formData, weightLossPlan: e.target.value})}
                  className="input-field"
                >
                  {weightLossPlans.map(plan => (
                    <option key={plan.name} value={plan.name}>{plan.name}</option>
                  ))}
                </select>
              </div>

              {/* Number of Meals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meals per Day
                </label>
                <select
                  value={formData.numberOfMeals}
                  onChange={(e) => setFormData({...formData, numberOfMeals: Number(e.target.value)})}
                  className="input-field"
                >
                  <option value={3}>3 meals</option>
                  <option value={4}>4 meals</option>
                  <option value={5}>5 meals</option>
                </select>
              </div>

              {/* Health Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Health Conditions (Optional)
                </label>
                <select
                  value={formData.illness || 'none'}
                  onChange={(e) => setFormData({...formData, illness: e.target.value})}
                  className="input-field"
                >
                  {illnessOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formData.illness && formData.illness !== 'none' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Recipes will be filtered to accommodate your health condition
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-2.5 text-base"
              >
                Generate Recommendations
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {results && (
              <>
                {/* BMI Results */}
                <div className="card">
                  <div className="flex items-center mb-4">
                    <Calculator className="h-6 w-6 text-primary-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">BMI Analysis</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {results.bmi} kg/m²
                    </div>
                    <div className={`text-lg font-semibold ${results.bmiColor} mb-2`}>
                      {results.bmiCategory}
                    </div>
                    <div className="text-sm text-gray-600">
                      BMR: {results.bmr} calories/day
                    </div>
                  </div>
                </div>

                {/* Calorie Plans */}
                <div className="card">
                  <div className="flex items-center mb-4">
                    <Target className="h-6 w-6 text-primary-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">Calorie Plans</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {results.caloriePlans.map((plan, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{plan.plan}</div>
                          <div className="text-sm text-gray-600">{plan.weightLoss}</div>
                        </div>
                        <div className="text-lg font-semibold text-primary-600">
                          {plan.calories}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meal Distribution */}
                <div className="card">
                  <div className="flex items-center mb-4">
                    <Activity className="h-6 w-6 text-primary-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">Meal Distribution</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(results.mealCalories).map(([meal, calories]) => (
                      <div key={meal} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900 capitalize">
                          {meal}
                        </div>
                        <div className="text-lg font-semibold text-primary-600">
                          {calories} cal
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recipe Recommendations */}
                <div className="card bg-primary-50 border-primary-200">
                  <h3 className="text-xl font-semibold text-primary-900 mb-3">
                    Recommended Recipes
                  </h3>
                  <p className="text-primary-700 mb-4">
                    Based on your nutritional profile, here are some recipes that match your dietary needs.
                  </p>
                  <button 
                    onClick={() => generateRecipeRecommendations()}
                    disabled={isGeneratingRecipes}
                    className="btn-primary inline-flex items-center disabled:opacity-50"
                  >
                    {isGeneratingRecipes ? 'Generating...' : 'Generate Recommendations'}
                    <Utensils className="ml-2 h-4 w-4" />
                  </button>
                </div>

              </>
            )}

            {!results && (
              <div className="lg:col-span-3 card text-center py-12">
                <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Fill out the form to get your personalized diet recommendations
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Display Recommended Recipes - Full Width Section */}
        {results && (Object.keys(groupedRecommendations).length > 0 || recommendedRecipes.length > 0) && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Your Personalized Recipe Recommendations
            </h3>
            {Object.keys(groupedRecommendations).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedRecommendations).map(([meal, list]) => (
                  <div key={meal}>
                    <div className="text-lg font-semibold capitalize mb-4">{meal}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {list.map((recipe, index) => (
                        <RecipeCard key={`${meal}-${index}`} recipe={recipe} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedRecipes.map((recipe, index) => (
                  <RecipeCard key={index} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

