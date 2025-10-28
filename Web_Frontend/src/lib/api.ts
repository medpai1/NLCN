import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export const api = axios.create({ baseURL: API_BASE })

export async function fetchRecipes(params: any) {
  const { data } = await api.get('/recipes', { params })
  return data
}

export async function fetchRecipe(id: number) {
  const { data } = await api.get(`/recipes/${id}`)
  return data
}

export async function fetchPlanner(range: { start?: string; end?: string }) {
  const { data } = await api.get('/planner', { params: range })
  return data
}

export async function addPlanner(entry: { date: string; meal: string; recipe_id: number }) {
  const { data } = await api.post('/planner', entry)
  return data
}

export async function removePlanner(params: { date_: string; meal: string; recipe_id: number }) {
  const { data } = await api.delete('/planner', { params })
  return data
}

export async function fetchActivities() {
  const { data } = await api.get('/activities')
  return data
}

export async function predictDiet(body: { nutrition_input: number[]; ingredients?: string[]; params?: { n_neighbors: number; return_distance: boolean } }) {
  const { data } = await api.post('/predict/', body)
  return data
}
