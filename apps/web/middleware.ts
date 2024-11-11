import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { uncachedAuth } from '@yuki/auth/uncached'

const _publicPaths = ['/api']

export const middleware = async (req: NextRequest) => {
  const _session = await uncachedAuth()
  const _pathName = new URL(req.url).pathname

  // do anything you want here

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
