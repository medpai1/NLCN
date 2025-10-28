import { useState } from 'react'
import { predictDiet } from '../lib/api'

export default function CustomRecommendation(){
  const [cal, setCal] = useState(500)
  const [fat, setFat] = useState(50)
  const [sat, setSat] = useState(0)
  const [chol, setChol] = useState(0)
  const [sod, setSod] = useState(400)
  const [carb, setCarb] = useState(100)
  const [fib, setFib] = useState(10)
  const [sug, setSug] = useState(10)
  const [prot, setProt] = useState(10)
  const [n, setN] = useState(10)
  const [ingredients, setIngredients] = useState('')
  const [items, setItems] = useState<any[]|null>(null)

  async function generate(){
    const nutrition_input=[cal,fat,sat,chol,sod,carb,fib,sug,prot]
    const params={ n_neighbors: n, return_distance: false }
    const ings = ingredients.trim()? ingredients.split(';').map(s=>s.trim()).filter(Boolean) : []
    const res = await predictDiet({ nutrition_input, ingredients: ings, params })
    setItems(res.output || [])
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Custom Food Recommendation</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 space-y-3">
          <Slider label="Calories" value={cal} set={setCal} min={0} max={2000} />
          <Slider label="FatContent" value={fat} set={setFat} min={0} max={100} />
          <Slider label="SaturatedFatContent" value={sat} set={setSat} min={0} max={13} />
          <Slider label="CholesterolContent" value={chol} set={setChol} min={0} max={300} />
          <Slider label="SodiumContent" value={sod} set={setSod} min={0} max={2300} />
          <Slider label="CarbohydrateContent" value={carb} set={setCarb} min={0} max={325} />
          <Slider label="FiberContent" value={fib} set={setFib} min={0} max={50} />
          <Slider label="SugarContent" value={sug} set={setSug} min={0} max={40} />
          <Slider label="ProteinContent" value={prot} set={setProt} min={0} max={40} />
          <label className="text-sm block">Number of recommendations<select className="mt-1 border rounded px-2 py-1 w-full" value={n} onChange={e=>setN(+e.target.value)}>{[5,10,15,20].map(x=> <option key={x} value={x}>{x}</option>)}</select></label>
          <label className="text-sm block">Ingredients (separated by ;) <input className="mt-1 border rounded px-2 py-1 w-full" value={ingredients} onChange={e=>setIngredients(e.target.value)} placeholder="Milk;eggs;butter..." /></label>
          <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded" onClick={generate}>Generate</button>
        </div>
        <div className="md:col-span-2 rounded-xl border bg-white p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(items||[]).map((r,i)=> (
              <div key={i} className="border rounded p-3">
                <div className="font-medium line-clamp-2">{r.Name}</div>
                <div className="text-xs text-gray-600 mt-1">Cal {r.Calories} · Carb {r.CarbohydrateContent} · Prot {r.ProteinContent}</div>
              </div>
            ))}
          </div>
          {items===null && <div className="text-gray-500">Set your targets and click Generate.</div>}
          {items!==null && !items?.length && <div className="text-gray-500">No recipes found for these constraints.</div>}
        </div>
      </div>
    </div>
  )
}

function Slider({label, value, set, min, max}:{label:string, value:number, set:(n:number)=>void, min:number, max:number}){
  return (
    <label className="text-sm block">
      {label}
      <input type="range" className="mt-1 w-full" min={min} max={max} value={value} onChange={e=>set(+e.target.value)} />
      <div className="text-xs text-gray-600">{value}</div>
    </label>
  )
}
