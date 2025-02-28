import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { auth } from '@yuki/auth'

export const middleware = async (
  request: NextRequest,
): Promise<NextResponse> => {
  if (request.method === 'GET') {
    const _session = await auth(request)

    return NextResponse.next()
  }

  // CSRF protection
  const originHeader = request.headers.get('Origin')
  const hostHeader = request.headers.get('Host')
  if (originHeader === null || hostHeader === null) {
    return new NextResponse(null, {
      status: 403,
    })
  }
  let origin: URL
  try {
    origin = new URL(originHeader)
  } catch {
    return new NextResponse(null, {
      status: 403,
    })
  }
  if (origin.host !== hostHeader)
    return new NextResponse(null, {
      status: 403,
    })

  return NextResponse.next()
}
