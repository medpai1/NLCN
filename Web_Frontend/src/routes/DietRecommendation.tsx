import { useMemo, useState } from 'react'
import { predictDiet } from '../lib/api'

const nutritions = ['Calories','FatContent','SaturatedFatContent','CholesterolContent','SodiumContent','CarbohydrateContent','FiberContent','SugarContent','ProteinContent'] as const

function bmi(weightKg: number, heightCm: number) {
  const h = heightCm/100
  return +(weightKg/(h*h)).toFixed(2)
}

function bmr(age:number, height:number, weight:number, gender:'Male'|'Female'){
  return gender==='Male' ? 10*weight+6.25*height-5*age+5 : 10*weight+6.25*height-5*age-161
}

export default function DietRecommendation(){
  const [age, setAge] = useState(25)
  const [height, setHeight] = useState(170)
  const [weight, setWeight] = useState(70)
  const [gender, setGender] = useState<'Male'|'Female'>('Male')
  const [activity, setActivity] = useState('Moderate exercise (3-5 days/wk)')
  const [plan, setPlan] = useState('Weight loss')
  const [mealsPerDay, setMealsPerDay] = useState(3)
  const [reco, setReco] = useState<any[][]>([])

  const activityWeights = ['Little/no exercise', 'Light exercise', 'Moderate exercise (3-5 days/wk)', 'Very active (6-7 days/wk)', 'Extra active (very active & physical job)']
  const activityFactors = [1.2,1.375,1.55,1.725,1.9]
  const planLabels = ['Maintain weight','Mild weight loss','Weight loss','Extreme weight loss']
  const planFactors = [1,0.9,0.8,0.6]

  const bmiVal = useMemo(()=> bmi(weight, height), [weight, height])
  const maintainCalories = useMemo(()=> bmr(age, height, weight, gender) * activityFactors[activityWeights.indexOf(activity)], [age,height,weight,gender,activity])
  const lossFactor = planFactors[planLabels.indexOf(plan)]

  const mealsPerc = useMemo(() => {
    if (mealsPerDay===3) return { breakfast:0.35, lunch:0.40, dinner:0.25 }
    if (mealsPerDay===4) return { breakfast:0.30, 'morning snack':0.05, lunch:0.40, dinner:0.25 }
    return { breakfast:0.30, 'morning snack':0.05, lunch:0.40, 'afternoon snack':0.05, dinner:0.20 }
  }, [mealsPerDay])

  async function generate(){
    const totalCal = maintainCalories * lossFactor
    const results: any[][] = []
    for (const meal of Object.keys(mealsPerc)){
      const mealCal = mealsPerc[meal as keyof typeof mealsPerc] * totalCal
      let recInput: number[]
      if (meal==='breakfast') recInput=[mealCal, rand(10,30), rand(0,4), rand(0,30), rand(0,400), rand(40,75), rand(4,10), rand(0,10), rand(30,100)]
      else if (meal==='lunch') recInput=[mealCal, rand(20,40), rand(0,4), rand(0,30), rand(0,400), rand(40,75), rand(4,20), rand(0,10), rand(50,175)]
      else if (meal==='dinner') recInput=[mealCal, rand(20,40), rand(0,4), rand(0,30), rand(0,400), rand(40,75), rand(4,20), rand(0,10), rand(50,175)]
      else recInput=[mealCal, rand(10,30), rand(0,4), rand(0,30), rand(0,400), rand(40,75), rand(4,10), rand(0,10), rand(30,100)]
      const res = await predictDiet({ nutrition_input: recInput, ingredients: [], params: { n_neighbors: 5, return_distance: false } })
      results.push(res.output || [])
    }
    setReco(results)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Automatic Diet Recommendation</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Age<input className="mt-1 border rounded px-2 py-1 w-full" type="number" value={age} onChange={e=>setAge(+e.target.value)} /></label>
            <label className="text-sm">Height (cm)<input className="mt-1 border rounded px-2 py-1 w-full" type="number" value={height} onChange={e=>setHeight(+e.target.value)} /></label>
            <label className="text-sm">Weight (kg)<input className="mt-1 border rounded px-2 py-1 w-full" type="number" value={weight} onChange={e=>setWeight(+e.target.value)} /></label>
            <label className="text-sm">Gender<select className="mt-1 border rounded px-2 py-1 w-full" value={gender} onChange={e=>setGender(e.target.value as any)}><option>Male</option><option>Female</option></select></label>
          </div>
          <label className="text-sm block">Activity<select className="mt-1 border rounded px-2 py-1 w-full" value={activity} onChange={e=>setActivity(e.target.value)}>{activityWeights.map(a=> <option key={a}>{a}</option>)}</select></label>
          <label className="text-sm block">Plan<select className="mt-1 border rounded px-2 py-1 w-full" value={plan} onChange={e=>setPlan(e.target.value)}>{planLabels.map(a=> <option key={a}>{a}</option>)}</select></label>
          <label className="text-sm block">Meals per day<input className="mt-1 border rounded px-2 py-1 w-full" type="number" min={3} max={5} value={mealsPerDay} onChange={e=>setMealsPerDay(+e.target.value)} /></label>
          <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded" onClick={generate}>Generate</button>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm">BMI: <strong>{bmiVal}</strong></div>
          <div className="text-sm mt-1">Maintain Calories: <strong>{Math.round(maintainCalories)}</strong></div>
          <div className="text-sm mt-1">Target Calories: <strong>{Math.round(maintainCalories*lossFactor)}</strong></div>
          <div className="mt-4 text-sm text-gray-600">Meals split: {Object.keys(mealsPerc).map(k=> `${k} ${Math.round(mealsPerc[k as keyof typeof mealsPerc]*100)}%`).join(' · ')}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-600">Tip: Use the Recipes page to preview nutrition details.</div>
        </div>
      </div>
      {!!reco.length && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Recommended recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reco.map((group, idx) => (
              <div key={idx} className="rounded-xl border bg-white p-4">
                <div className="font-medium mb-2">Meal {idx+1}</div>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {group.map((r: any, i: number) => (
                    <div key={i} className="border rounded p-2">
                      <div className="font-medium text-sm line-clamp-2">{r.Name}</div>
                      <div className="text-xs text-gray-600 mt-1">Cal {r.Calories} · Carb {r.CarbohydrateContent} · Prot {r.ProteinContent}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function rand(min:number, max:number){
  return +(Math.random()*(max-min)+min).toFixed(2)
}
