'use client'

import { useState } from 'react'
import { usePlanner, MealType } from '@/components/PlannerProvider'

export function AddToPlanButton({ recipe }: { recipe: { Name: string; Calories?: number; image_link?: string } }) {
  const { addToPlan } = usePlanner()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [meal, setMeal] = useState<MealType>('breakfast')

  const onAdd = () => {
    addToPlan(date, meal, { Name: recipe.Name, Calories: recipe.Calories || 0, image_link: recipe.image_link })
    setOpen(false)
  }

  return (
    <div className="inline-block">
      <button className="btn-secondary text-sm" onClick={() => setOpen(true)}>Add to Plan</button>
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-80 shadow-lg">
            <div className="font-semibold mb-3">Add to Meal Plan</div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input type="date" className="input-field w-full" value={date} onChange={(e)=>setDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Meal</label>
                <select className="input-field w-full" value={meal} onChange={(e)=>setMeal(e.target.value as MealType)}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack1">Morning Snack</option>
                  <option value="snack2">Afternoon Snack</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button className="btn-secondary" onClick={()=>setOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={onAdd}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



