'use server'

import { cookies } from 'next/headers'

import { env } from '@yuki/env'

export const setSessionCookie = async (session: {
  sessionToken: string
  expires: Date
}) => {
  const nextCookies = await cookies()

  nextCookies.set('auth_token', session.sessionToken, {
    httpOnly: true,
    path: '/',
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: session.expires,
  })
}
