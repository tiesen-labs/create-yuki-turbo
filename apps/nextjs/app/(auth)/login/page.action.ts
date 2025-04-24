'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { env } from '@yuki/env'

export const setSessionCookie = async (
  session: {
    sessionToken: string
    expires: Date
  },
  redirect_uri?: string,
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
      redirect_uri
        ? redirect_uri.startsWith('http://') ||
          redirect_uri.startsWith('https://') ||
          redirect_uri.startsWith('exp:')
          ? `${redirect_uri}?token=${session.sessionToken}`
          : redirect_uri
        : '/',
    )
  }
}
