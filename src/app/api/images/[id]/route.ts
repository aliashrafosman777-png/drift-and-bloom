import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { readProductImage } from '@/lib/productImageStorage'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

interface RouteParams {
  params: Promise<{ id: string }>
}

function notFound() {
  return Response.json(
    { success: false, message: 'Image not found.' },
    { status: 404, headers: { 'Cache-Control': 'private, no-store' } },
  )
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const requestId = randomUUID()
  try {
    const { id } = await params
    if (!/^[0-9a-f]{24}$/i.test(id)) return notFound()

    const stored = await readProductImage(id)
    if (!stored) return notFound()

    const etag = `"${stored.file.id}"`
    const headers = new Headers({
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': String(stored.bytes.length),
      'Content-Type': stored.file.contentType,
      'ETag': etag,
      'Last-Modified': stored.file.uploadDate.toUTCString(),
      'X-Content-Type-Options': 'nosniff',
    })
    if (req.headers.get('if-none-match') === etag) {
      headers.delete('Content-Length')
      return new Response(null, { status: 304, headers })
    }

    return new Response(stored.bytes, { status: 200, headers })
  } catch (error) {
    const err = error as { name?: string; message?: string }
    console.error('[images.get]', {
      requestId,
      errorName: err?.name || 'UnknownError',
      message: String(err?.message || 'Unknown error').slice(0, 500),
    })
    return Response.json(
      { success: false, message: 'Image could not be loaded.' },
      { status: 500, headers: { 'Cache-Control': 'private, no-store' } },
    )
  }
}
