import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { auth } from '@yuki/auth'

export default async (_req: NextRequest) => {
  const _session = await auth() //  { session: { user: { ... } } }
  return NextResponse.next()
}

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
