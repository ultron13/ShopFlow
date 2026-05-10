import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req: NextRequest & { auth?: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl

  // Admin route guard
  if (pathname.startsWith('/admin')) {
    const user = req.auth?.user
    if (!user || (user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }

  // Account route guard
  if (pathname.startsWith('/account')) {
    if (!req.auth?.user) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
