import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { auth } from '@yuki/auth'

const protectedRoute: string[] = []

export const middleware = async (req: NextRequest) => {
  const pathName = req.nextUrl.pathname

  const session = await auth(req)
  if (session.user) return NextResponse.next()

  if (protectedRoute.some((route) => pathName.startsWith(route))) {
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
