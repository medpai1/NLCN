import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse'
import zlib from 'zlib'

// Shape aligned with FastAPI output and dataset columns
interface RecipeRow {
	Name: string
	CookTime: string
	PrepTime: string
	TotalTime: string
	RecipeIngredientParts: string
	Calories: string
	FatContent: string
	SaturatedFatContent: string
	CholesterolContent: string
	SodiumContent: string
	CarbohydrateContent: string
	FiberContent: string
	SugarContent: string
	ProteinContent: string
	RecipeInstructions: string
	[key: string]: string
}

function normalizeNumber(value?: string): number {
	if (!value) return 0
	const n = Number(String(value).replace(/[^0-9.\-]/g, ''))
	return Number.isFinite(n) ? n : 0
}

function csvFilePath(): string {
	// The repo root has Data/dataset.csv (gzipped content)
	return path.join(process.cwd(), 'Data', 'dataset.csv')
}

function isGzipFile(filePath: string): boolean {
	try {
		const fd = fs.openSync(filePath, 'r')
		const buffer = Buffer.alloc(2)
		fs.readSync(fd, buffer, 0, 2, 0)
		fs.closeSync(fd)
		// GZIP magic numbers 1F 8B
		return buffer[0] === 0x1f && buffer[1] === 0x8b
	} catch {
		return false
	}
}

function createCsvParserStream(filePath: string) {
	const fileStream = fs.createReadStream(filePath)
	const inputStream = isGzipFile(filePath) ? fileStream.pipe(zlib.createGunzip()) : fileStream
	return inputStream.pipe(parse({ columns: true, skip_empty_lines: true }))
}

// Simple in-memory cache for parsed rows (without images)
let cachedRows: RecipeRow[] | null = null
let cacheLoaded = false
async function loadDatasetIntoMemory(filePath: string): Promise<RecipeRow[]> {
    if (cacheLoaded && cachedRows) return cachedRows
    const rows: RecipeRow[] = []
    await new Promise<void>((resolve, reject) => {
        createCsvParserStream(filePath)
            .on('data', (row: RecipeRow) => {
                rows.push(row)
            })
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
    })
    cachedRows = rows
    cacheLoaded = true
    return rows
}

async function fetchRecipeImage(name: string): Promise<string> {
	const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) {
        // fallback to SVG placeholder if no key
        return `/api/placeholder?width=400&height=300&text=${encodeURIComponent(name)}`
    }
	try {
		const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(name)}&per_page=1&client_id=${accessKey}`
		const response = await fetch(url)
		if (!response.ok) throw new Error('Unsplash request failed')
		const data = await response.json()
		if (data.results && data.results.length > 0 && data.results[0].urls?.regular) {
			return data.results[0].urls.regular
		}
	} catch (err) {
		// ignore errors, fall back below
	}
    // fallback to SVG placeholder
    return `/api/placeholder?width=400&height=300&text=${encodeURIComponent(name)}`
}

function toRecipe(row: RecipeRow) {
	// For compatibility; old toRecipe still exists below for streaming path
	return fetchRecipeImage(row.Name).then(image_link => ({
		Name: row.Name,
		CookTime: row.CookTime,
		PrepTime: row.PrepTime,
		TotalTime: row.TotalTime,
		RecipeIngredientParts: extractQuotedStrings(row.RecipeIngredientParts),
		Calories: normalizeNumber(row.Calories),
		FatContent: normalizeNumber(row.FatContent),
		SaturatedFatContent: normalizeNumber(row.SaturatedFatContent),
		CholesterolContent: normalizeNumber(row.CholesterolContent),
		SodiumContent: normalizeNumber(row.SodiumContent),
		CarbohydrateContent: normalizeNumber(row.CarbohydrateContent),
		FiberContent: normalizeNumber(row.FiberContent),
		SugarContent: normalizeNumber(row.SugarContent),
		ProteinContent: normalizeNumber(row.ProteinContent),
		RecipeInstructions: extractQuotedStrings(row.RecipeInstructions),
		image_link,
	}))
}

function extractQuotedStrings(s?: string): string[] {
	if (!s) return []
	const matches = String(s).match(/\"([^\"]*)\"/g)
	if (!matches) return []
	return matches.map((m) => m.replace(/^\"|\"$/g, ''))
}

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const page = Math.max(1, Number(searchParams.get('page') || '1'))
	const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') || '12')))
	const q = (searchParams.get('q') || '').toLowerCase()
	const category = (searchParams.get('category') || '').toLowerCase()
  const sort = searchParams.get('sort') || 'name' // name|calories-low|calories-high|time-low|time-high

	const filePath = csvFilePath()
	if (!fs.existsSync(filePath)) {
		return NextResponse.json({ error: 'dataset.csv not found' }, { status: 404 })
	}

	const startIndex = (page - 1) * pageSize
	const endIndex = startIndex + pageSize

	let total = 0
	let returned = 0
	let currentIndex = 0

	const results: any[] = []

  const needsGlobal = q || category || sort !== 'name'
  // Hard cap to keep response fast even with filters/sorts
  const MAX_SCAN = 3000

	try {
        if (needsGlobal) {
            // Use in-memory cache instead of re-reading the CSV each time
            const rows = await loadDatasetIntoMemory(filePath)
            const all: any[] = []
            for (let i = 0; i < rows.length; i++) {
                if (all.length >= MAX_SCAN) break
                const row = rows[i]
                const name = (row.Name || '').toLowerCase()
                const ingredients = (row.RecipeIngredientParts || '').toLowerCase()
                const instructions = (row.RecipeInstructions || '').toLowerCase()
                const searchableText = `${name} ${ingredients} ${instructions}`

                let ok = true
                if (q) {
                    const searchTerms = q.split(/\s+/).filter(term => term.length > 0)
                    ok = ok && searchTerms.every(term => searchableText.includes(term.toLowerCase()))
                }
                if (category && category !== 'all') {
                    const categoryPatterns: { [key: string]: string[] } = {
                        'main': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'turkey', 'lamb', 'pasta', 'rice', 'quinoa'],
                        'salad': ['salad', 'lettuce', 'spinach', 'arugula', 'kale'],
                        'soup': ['soup', 'stew', 'broth', 'chowder'],
                        'dessert': ['cake', 'pie', 'cookie', 'dessert', 'pudding', 'ice cream', 'chocolate'],
                        'breakfast': ['pancake', 'waffle', 'egg', 'toast', 'cereal', 'oatmeal', 'breakfast'],
                        'snack': ['snack', 'cracker', 'chip', 'dip', 'appetizer']
                    }
                    const patterns = categoryPatterns[category] || []
                    ok = ok && patterns.some(pattern => name.includes(pattern))
                }
                if (!ok) continue
                all.push(row)
            }

            total = all.length

			all.sort((a, b) => {
				if (sort === 'calories-low') {
					return normalizeNumber(a.Calories) - normalizeNumber(b.Calories)
				}
				if (sort === 'calories-high') {
					return normalizeNumber(b.Calories) - normalizeNumber(a.Calories)
				}
				if (sort === 'time-low') {
					return normalizeNumber(a.TotalTime) - normalizeNumber(b.TotalTime)
				}
				if (sort === 'time-high') {
					return normalizeNumber(b.TotalTime) - normalizeNumber(a.TotalTime)
				}
				// Default to name sorting
				return String(a.Name || '').localeCompare(String(b.Name || ''))
			})

			// Await images for actual returned page of recipes only
            // Only fetch images for current page
            const pageSlice = all.slice(startIndex, endIndex)
            const pageItems = await Promise.all(pageSlice.map((row) => toRecipe(row)))
			returned = pageItems.length
			return NextResponse.json({ page, pageSize, total, items: pageItems })
		}

		// Stream-only paging (no filters/sort):
		// leave this path as-is for now, still use old placeholder
		await new Promise<void>((resolve, reject) => {
			createCsvParserStream(filePath)
				.on('data', (row: RecipeRow) => {
					total += 1
					if (currentIndex >= startIndex && currentIndex < endIndex) {
						results.push({ ...toRecipeOld(row) })
						returned += 1
					}
					currentIndex += 1
				})
				.on('end', () => resolve())
				.on('error', (err) => reject(err))
		})
		return NextResponse.json({ page, pageSize, total, items: results })
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Failed to read dataset' }, { status: 500 })
	}
}

// Old version for streaming only. Keep this for non-filter cases (to keep code size diff minimal for review).
function toRecipeOld(row: RecipeRow) {
	return {
		Name: row.Name,
		CookTime: row.CookTime,
		PrepTime: row.PrepTime,
		TotalTime: row.TotalTime,
		RecipeIngredientParts: extractQuotedStrings(row.RecipeIngredientParts),
		Calories: normalizeNumber(row.Calories),
		FatContent: normalizeNumber(row.FatContent),
		SaturatedFatContent: normalizeNumber(row.SaturatedFatContent),
		CholesterolContent: normalizeNumber(row.CholesterolContent),
		SodiumContent: normalizeNumber(row.SodiumContent),
		CarbohydrateContent: normalizeNumber(row.CarbohydrateContent),
		FiberContent: normalizeNumber(row.FiberContent),
		SugarContent: normalizeNumber(row.SugarContent),
		ProteinContent: normalizeNumber(row.ProteinContent),
		RecipeInstructions: extractQuotedStrings(row.RecipeInstructions),
		image_link: `/api/placeholder/400/300?text=${encodeURIComponent(row.Name)}`,
	}
}
