'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { env } from '@yuki/env'

export const setSessionCookie = async (
  session: {
    sessionToken: string
    expires: Date
  },
  redirect_to?: string,
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
      redirect_to
        ? redirect_to.startsWith('http://') ||
          redirect_to.startsWith('https://') ||
          redirect_to.startsWith('exp:')
          ? `${redirect_to}?token=${session.sessionToken}`
          : redirect_to
        : '/',
    )
  }
}
