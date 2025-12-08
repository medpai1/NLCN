"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Grid, List } from 'lucide-react'
import RecipeCard from '@/components/RecipeCard'
import Link from 'next/link'

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
	category?: string
	tags?: string[]
	rating?: number
	isFavorite?: boolean
}

interface ApiResponse {
	page: number
	pageSize: number
	total: number
	items: Recipe[]
	error?: string
}

export default function Recipes() {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
	const [sortBy, setSortBy] = useState('name')
	const [page, setPage] = useState(1)
	const pageSize = 12

  const [data, setData] = useState<ApiResponse | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

	const categories = ['all', 'main', 'salad', 'soup', 'dessert', 'breakfast', 'snack']
  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'calories-low', label: 'Calories Low to High' },
    { value: 'calories-high', label: 'Calories High to Low' },
    { value: 'time-low', label: 'Cooking Time Low to High' },
    { value: 'time-high', label: 'Cooking Time High to Low' }
  ]

	const totalPages = useMemo(() => {
		if (!data) return 1
		return Math.max(1, Math.ceil(data.total / pageSize))
	}, [data])

  useEffect(() => {
    let cancel = false
    const run = () => {
      (async () => {
        setIsLoading(true)
        setError(null)
        try {
          const params = new URLSearchParams()
          params.set('page', String(page))
          params.set('pageSize', String(pageSize))
          if (searchTerm) params.set('q', searchTerm)
          if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory)
          if (sortBy) params.set('sort', sortBy)

          const res = await fetch(`/api/recipes?${params.toString()}`)
          const json: ApiResponse = await res.json()
          if (cancel) return
          if (json.error) throw new Error(json.error)
          setData(json)
        } catch (e: any) {
          setError(e?.message || 'Failed to load recipes')
        } finally {
          if (!cancel) setIsLoading(false)
        }
      })()
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    // debounce 300ms for search/sort/category/page
    debounceTimerRef.current = setTimeout(run, 300)
    return () => {
      cancel = true
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [page, pageSize, searchTerm, selectedCategory, sortBy])

	const items = data?.items || []

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Recipe Collection</h1>
						<p className="text-gray-600">Discover and manage your favorite recipes</p>
					</div>
				</div>

				{/* Search and Filters */}
				<div className="card mb-8">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						{/* Search */}
						<div className="md:col-span-2">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<input
									type="text"
									placeholder="Search recipes..."
									value={searchTerm}
									onChange={(e) => { setPage(1); setSearchTerm(e.target.value) }}
									className="input-field pl-10"
								/>
							</div>
						</div>

						{/* Category Filter */}
						<div>
							<select
								value={selectedCategory}
								onChange={(e) => { setPage(1); setSelectedCategory(e.target.value) }}
								className="input-field"
							>
								{categories.map(category => (
									<option key={category} value={category}>
										{category === 'all' ? 'All Categories' : category}
									</option>
								))}
							</select>
						</div>

						{/* Sort */}
						<div>
							<select
								value={sortBy}
								onChange={(e) => { setPage(1); setSortBy(e.target.value) }}
								className="input-field"
							>
								{sortOptions.map(option => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* View Mode Toggle and Count */}
					<div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
						<div className="text-sm text-gray-600">
							{isLoading ? 'Loading...' : `${data?.total ?? 0} recipes found`}
						</div>
						<div className="flex items-center space-x-2">
							<button
								onClick={() => setViewMode('grid')}
								className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
							>
								<Grid className="h-4 w-4" />
							</button>
							<button
								onClick={() => setViewMode('list')}
								className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
							>
								<List className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>

				{/* Error */}
				{error && (
					<div className="card bg-red-50 border-red-200 mb-6">
						<p className="text-red-700">{error}</p>
					</div>
				)}

				{/* Recipe Grid/List */}
				{items.length > 0 ? (
					<div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
						{items.map((recipe, index) => (
							<RecipeCard key={index} recipe={recipe} />
						))}
					</div>
				) : (
					<div className="card text-center py-12">
						<div className="text-gray-400 mb-4">
							<Search className="h-12 w-12 mx-auto" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
						<p className="text-gray-600 mb-4">
							Try adjusting your search terms or filters
						</p>
					</div>
				)}

				{/* Pagination */}
				<div className="flex items-center justify-between mt-8">
					<div className="text-sm text-gray-600">
						Page {page} of {totalPages}
					</div>
					<div className="flex space-x-2">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1 || isLoading}
							className="btn-secondary disabled:opacity-50"
						>
							Previous
						</button>
						<button
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page >= totalPages || isLoading}
							className="btn-primary disabled:opacity-50"
						>
							Next
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
