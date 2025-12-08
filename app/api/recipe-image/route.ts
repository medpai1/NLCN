import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name') || 'Recipe Image'

  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    return NextResponse.json({ url: `/api/placeholder?width=400&height=300&text=${encodeURIComponent(name)}` })
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(name)}&per_page=1&client_id=${accessKey}`
    const response = await fetch(url)
    if (response.ok) {
      const data = await response.json()
      const candidate = data?.results?.[0]?.urls?.regular
      if (candidate) {
        return NextResponse.json({ url: candidate })
      }
    }
  } catch (_) {}

  return NextResponse.json({ url: `/api/placeholder?width=400&height=300&text=${encodeURIComponent(name)}` })
}





