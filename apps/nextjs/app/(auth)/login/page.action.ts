'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { env } from '@yuki/env'

export const setSessionCookie = async (
  session: { sessionToken: string; expires: Date },
  redirectTo: string,
) => {
  try {
    const nextCookies = await cookies()

    nextCookies.set('auth_token', session.sessionToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      expires: session.expires,
    })
  } catch (error) {
    console.error('Error setting session cookie:', error)
  } finally {
    redirect(
      redirectTo.startsWith('http://') ||
        redirectTo.startsWith('https://') ||
        redirectTo.startsWith('exp:')
        ? `${redirectTo}?token=${session.sessionToken}`
        : redirectTo,
    )
  }
}
