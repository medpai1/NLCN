import { useEffect, useMemo, useState } from 'react'
import { addPlanner, fetchPlanner, removePlanner } from '../lib/api'

function isoToday() {
  return new Date().toISOString().slice(0,10)
}

function startOfWeek(d: Date) {
  const day = d.getDay() || 7
  const s = new Date(d)
  s.setDate(d.getDate() - (day - 1))
  return s
}

function addDays(d: Date, i: number) {
  const n = new Date(d)
  n.setDate(d.getDate() + i)
  return n
}

export default function Planner() {
  const today = new Date()
  const sow = startOfWeek(today)
  const days = useMemo(()=> Array.from({length:7}, (_,i)=> addDays(sow, i).toISOString().slice(0,10)), [sow])
  const meals = ['breakfast','lunch','dinner','snack'] as const

  const [assign, setAssign] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchPlanner({ start: days[0], end: days[6] }).then((d) => {
      const map: Record<string,string> = {}
      for (const p of (d.items||[])) {
        map[`${p.date}::${p.meal}`] = String(p.recipe_id)
      }
      setAssign(map)
      setLoading(false)
    })
  }, [days[0], days[6]])

  async function save() {
    // remove all existing
    const current = await fetchPlanner({ start: days[0], end: days[6] })
    for (const p of (current.items||[])) {
      await removePlanner({ date_: p.date, meal: p.meal, recipe_id: p.recipe_id })
    }
    // add new
    for (const key of Object.keys(assign)) {
      const [d, meal] = key.split('::')
      const v = assign[key].trim()
      if (!v) continue
      const rid = Number(v)
      if (Number.isNaN(rid)) continue
      await addPlanner({ date: d, meal, recipe_id: rid })
    }
    alert('Planner saved')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Weekly Planner</h1>
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Date</th>
              {meals.map(m => <th key={m} className="p-2 text-left capitalize">{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {days.map(d => (
              <tr key={d} className="border-t">
                <td className="p-2">{d}</td>
                {meals.map(m => {
                  const key = `${d}::${m}`
                  return (
                    <td key={key} className="p-2">
                      <input className="border rounded px-2 py-1 w-full" placeholder="recipe id" value={assign[key]||''} onChange={e=> setAssign(a=> ({...a, [key]: e.target.value}))} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded">Save Plan</button>
      </div>
      {loading && <div className="text-gray-500">Loading current plan…</div>}
    </div>
  )
}
