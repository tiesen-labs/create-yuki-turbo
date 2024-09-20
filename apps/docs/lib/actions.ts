'use server'

import { cookies } from 'next/headers'

import { lucia } from '@yuki/auth/lucia'

export const signOut = async (sessionId: string) => {
  await lucia.invalidateSession(sessionId)
  const sessionCookie = lucia.createBlankSessionCookie()
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
}
