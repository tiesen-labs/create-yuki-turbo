import type { MiddlewareConfig, NextMiddleware } from 'next/server'
import { NextResponse } from 'next/server'

import { auth } from '@yuki/auth'

const authRoutes: string[] = ['/login', '/register']
const protectedRoutes: string[] = ['/protected']

export const middleware: NextMiddleware = async (req, _event) => {
  const pathName = req.nextUrl.pathname

  if (req.method === 'GET') {
    const session = await auth(req)

    if (
      !session.user &&
      protectedRoutes.some((route) => pathName.startsWith(route))
    ) {
      const url = new URL('/login', req.url)
      url.searchParams.set('redirect_uri', pathName)
      return NextResponse.redirect(url)
    }

    if (session.user && authRoutes.some((route) => pathName.startsWith(route)))
      return NextResponse.redirect(new URL('/', req.url))

    return NextResponse.next()
  }

  /**
   * CSRF protection
   *
   * This implementation follows the principle that GET requests are safe from CSRF attacks
   * as they should not modify state. Only GET requests are allowed to pass through without
   * additional verification.
   *
   * Note: For complete CSRF protection, non-GET requests should include:
   * - Verification of CSRF tokens
   * - Origin/Referer header validation
   * - Additional measures depending on the application requirements
   */
  const originHeader = req.headers.get('Origin') ?? ''
  const hostHeader =
    req.headers.get('Host') ?? req.headers.get('X-Forwarded-Host') ?? ''
  if (!originHeader || !hostHeader)
    return new NextResponse(null, { status: 403 })

  let originUrl: URL
  try {
    originUrl = new URL(originHeader)
  } catch {
    return new NextResponse(null, { status: 403 })
  }
  if (originUrl.host !== hostHeader)
    return new NextResponse(null, { status: 403 })

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    /*
     * Match all request paths starting with:
     * - api (API routes)
     */
    '/api/(.*)',
  ],
} satisfies MiddlewareConfig
