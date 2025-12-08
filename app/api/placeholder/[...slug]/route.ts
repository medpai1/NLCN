import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const slug = params.slug || []
  const width = Number(slug[0]) || 400
  const height = Number(slug[1]) || 300
  const text = decodeURIComponent((new URL(req.url)).searchParams.get('text') || 'Recipe Image')

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <rect x="2" y="2" width="${width-4}" height="${height-4}" fill="none" stroke="#d1d5db" stroke-width="2"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
    ${text.length > 20 ? text.substring(0, 20) + '...' : text}
  </text>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
