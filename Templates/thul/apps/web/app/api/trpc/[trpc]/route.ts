import { type NextRequest, NextResponse } from 'next/server'

const API_URL = process.env['API_URL'] ?? 'http://localhost:4000'

async function handler(req: NextRequest, { params }: { params: Promise<{ trpc: string }> }) {
  const { trpc } = await params
  const url = new URL(`${API_URL}/trpc/${trpc}${req.nextUrl.search}`)

  const headers = new Headers(req.headers)
  headers.delete('host')

  const init: RequestInit = {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    // @ts-expect-error -- Node.js fetch supports duplex
    duplex: 'half',
  }

  try {
    const res = await fetch(url.toString(), init)
    return new NextResponse(res.body, {
      status: res.status,
      headers: res.headers,
    })
  } catch {
    return NextResponse.json({ error: 'API unreachable' }, { status: 502 })
  }
}

export { handler as GET, handler as POST }
