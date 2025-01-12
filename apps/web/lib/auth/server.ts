'use server'

import { cache } from 'react'
import { cookies } from 'next/headers'

import type { SessionValidation } from '@yuki/auth'
import {
  createSession,
  generateSessionToken,
  invalidateSession,
  validateSessionToken,
} from '@yuki/auth'
import { authEnv } from '@yuki/auth/env'

import { env } from '@/env'

const KEY = 'auth_token'

export const auth = cache(async (): Promise<SessionValidation> => {
  const token = (await cookies()).get(KEY)?.value ?? ''
  if (!token) return { expires: new Date(Date.now()) }
  return validateSessionToken(token)
})

export const signIn = async (userId: string) => {
  const token = generateSessionToken()
  const session = await createSession(token, userId)
  ;(await cookies()).set(KEY, token, {
    httpOnly: true,
    path: '/',
    secure: authEnv.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: session.expiresAt,
  })
}

export const signOut = async () => {
  const token = (await cookies()).get(KEY)?.value ?? ''
  if (!token) return

  await invalidateSession(token)
  ;(await cookies()).set(KEY, '', {
    httpOnly: true,
    path: '/',
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  })
}
