import { useEffect, useMemo, useState } from 'react'
import { fetchRecipe, fetchRecipes } from '../lib/api'

export default function Recipes() {
  const [search, setSearch] = useState('')
  const [ingredient, setIngredient] = useState('')
  const [minCal, setMinCal] = useState<number | ''>('')
  const [maxCal, setMaxCal] = useState<number | ''>('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<any | null>(null)

  useEffect(() => {
    const params: any = {
      search: search || undefined,
      ingredient: ingredient || undefined,
      min_calories: minCal === '' ? undefined : Number(minCal),
      max_calories: maxCal === '' ? undefined : Number(maxCal),
      limit,
      offset: (page - 1) * limit,
    }
    fetchRecipes(params).then((d) => {
      setItems(d.items || [])
      setTotal(d.total || 0)
      if ((d.items || []).length && selectedId == null) {
        setSelectedId(d.items[0].id)
      }
    })
  }, [search, ingredient, minCal, maxCal, page, limit])

  useEffect(() => {
    if (selectedId == null) { setDetail(null); return }
    fetchRecipe(selectedId).then((d) => setDetail(d.item || null))
  }, [selectedId])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input className="border rounded px-3 py-2" placeholder="Search by name" value={search} onChange={e=>setSearch(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Contains ingredient" value={ingredient} onChange={e=>setIngredient(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Min calories" value={minCal} onChange={e=>setMinCal(e.target.value === '' ? '' : Number(e.target.value))} />
        <input className="border rounded px-3 py-2" placeholder="Max calories" value={maxCal} onChange={e=>setMaxCal(e.target.value === '' ? '' : Number(e.target.value))} />
        <select className="border rounded px-3 py-2" value={limit} onChange={e=>setLimit(Number(e.target.value))}>
          {[10,20,50,100,200].map(n=> <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button className="border rounded px-3 py-1" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
        <div>Page {page} / {totalPages}</div>
        <button className="border rounded px-3 py-1" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(r => (
            <div key={r.id} className={`rounded-xl border bg-white p-4 hover:shadow cursor-pointer ${selectedId===r.id? 'ring-2 ring-emerald-400' : ''}`} onClick={()=>setSelectedId(r.id)}>
              <div className="text-sm text-gray-500">#{r.id}</div>
              <div className="mt-1 font-semibold line-clamp-2">{r.Name}</div>
              <div className="mt-3 grid grid-cols-3 text-xs text-gray-600">
                <div><span className="text-gray-500">Cal</span> {r.Calories}</div>
                <div><span className="text-gray-500">Carb</span> {r.CarbohydrateContent}</div>
                <div><span className="text-gray-500">Prot</span> {r.ProteinContent}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="border rounded-xl p-4 bg-white sticky top-4 h-max">
          {detail ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{detail.Name}</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Calories: <strong>{detail.Calories}</strong></div>
                <div>Fat: <strong>{detail.FatContent}</strong></div>
                <div>Carbs: <strong>{detail.CarbohydrateContent}</strong></div>
                <div>Protein: <strong>{detail.ProteinContent}</strong></div>
              </div>
              <div>
                <h3 className="font-medium mb-1">Ingredients</h3>
                <div className="text-sm whitespace-pre-wrap max-h-48 overflow-auto">{String(detail.RecipeIngredientParts || '')}</div>
              </div>
              <div>
                <h3 className="font-medium mb-1">Instructions</h3>
                <div className="text-sm whitespace-pre-wrap max-h-48 overflow-auto">{String(detail.RecipeInstructions || '')}</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Select a recipe to view details</div>
          )}
        </div>
      </div>
    </div>
  )
}
