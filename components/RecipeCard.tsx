'use client'

import { useState } from 'react'
import { Clock, Users, ChefHat, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { AddToPlanButton } from '@/components/AddToPlanButton'
import Image from 'next/image'

interface Recipe {
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

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const nutritionData = [
    { label: 'Calories', value: recipe.Calories, unit: 'kcal' },
    { label: 'Fat', value: recipe.FatContent, unit: 'g' },
    { label: 'Carbs', value: recipe.CarbohydrateContent, unit: 'g' },
    { label: 'Protein', value: recipe.ProteinContent, unit: 'g' },
    { label: 'Fiber', value: recipe.FiberContent, unit: 'g' },
    { label: 'Sugar', value: recipe.SugarContent, unit: 'g' },
  ]

  return (
    <div className="card hover:shadow-xl transition-all duration-300 group overflow-hidden">
      {/* Recipe Image */}
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
        {imgError ? (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-gray-500 text-sm font-medium">{recipe.Name}</div>
              <div className="text-gray-400 text-xs mt-1">Recipe Image</div>
            </div>
          </div>
        ) : recipe.image_link && recipe.image_link.startsWith('/api/placeholder') ? (
          <img
            src={recipe.image_link}
            alt={recipe.Name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            style={{ height: '100%', width: '100%' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <Image
            src={recipe.image_link || '/api/placeholder?width=400&height=300&text=Recipe+Image'}
            alt={recipe.Name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized={true}
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700">
          {recipe.Calories} cal
        </div>
      </div>

      {/* Recipe Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 break-words">
            {recipe.Name}
          </h3>
          
          {/* Time Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Prep: {recipe.PrepTime}min</span>
            </div>
            <div className="flex items-center">
              <ChefHat className="h-4 w-4 mr-1" />
              <span>Cook: {recipe.CookTime}min</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>Total: {recipe.TotalTime}min</span>
            </div>
          </div>
        </div>

        {/* Nutrition Overview */}
        <div className="grid grid-cols-3 gap-2">
          {nutritionData.slice(0, 3).map(({ label, value, unit }) => (
            <div key={label} className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900">{value}{unit}</div>
              <div className="text-xs text-gray-600">{label}</div>
            </div>
          ))}
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <span className="text-sm font-medium text-gray-700 mr-2">
            {isExpanded ? 'Show Less' : 'View Details'}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Full Nutrition Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Nutritional Information</h4>
              <div className="grid grid-cols-2 gap-2">
                {nutritionData.map(({ label, value, unit }) => (
                  <div key={label} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-medium text-gray-900">{value}{unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Ingredients</h4>
              <ul className="space-y-1">
                {recipe.RecipeIngredientParts.map((ingredient, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span className="break-words">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Instructions</h4>
              <ol className="space-y-2">
                {recipe.RecipeInstructions.map((instruction, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="break-words flex-1">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4">
              <button className="flex-1 min-w-[120px] btn-primary text-sm py-2">
                Save Recipe
              </button>
              <button className="flex-1 min-w-[120px] btn-secondary text-sm py-2 flex items-center justify-center">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Full Recipe
              </button>
              <div className="w-full sm:w-auto">
                <AddToPlanButton recipe={recipe} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

