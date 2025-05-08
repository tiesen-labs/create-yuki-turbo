'use server'

import { sha256 } from '@oslojs/crypto/sha2'
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding'

import { db, eq } from '@yuki/db'
import { sessions, users } from '@yuki/db/schema'

import type { SessionResult } from '../types'

const TOKEN_BYTES = 20
const SESSION_EXPIRATION = 1000 * 60 * 60 * 24 * 30 // 30 days
const SESSION_REFRESH_THRESHOLD = SESSION_EXPIRATION / 2 // 15 days

export async function createSession(
  userId: string,
): Promise<{ sessionToken: string; expires: Date }> {
  const token = generateToken()
  const sessionToken = hashToken(token)
  const expires = new Date(Date.now() + SESSION_EXPIRATION)

  const [session] = await db
    .insert(sessions)
    .values({ sessionToken, expires, userId })
    .returning()

  if (!session) throw new Error('Failed to create session')
  return { sessionToken: token, expires: session.expires }
}

export async function validateToken(token: string): Promise<SessionResult> {
  const sessionToken = hashToken(token)

  const [result] = await db
    .select({
      sessionToken: sessions.sessionToken,
      expires: sessions.expires,
      user: users,
    })
    .from(sessions)
    .where(eq(sessions.sessionToken, sessionToken))
    .innerJoin(users, eq(users.id, sessions.userId))

  if (!result) return { expires: new Date() }

  const { user, ...session } = result
  const now = Date.now()

  if (now > session.expires.getTime()) {
    await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken))
    return { expires: new Date() }
  }

  if (now >= session.expires.getTime() - SESSION_REFRESH_THRESHOLD) {
    const newExpires = new Date(Date.now() + SESSION_EXPIRATION)
    await db
      .update(sessions)
      .set({ expires: newExpires })
      .where(eq(sessions.sessionToken, sessionToken))
    session.expires = newExpires
  }

  return { user, expires: session.expires }
}

export async function invalidateToken(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.sessionToken, hashToken(token)))
}

export async function invalidateAllTokens(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId))
}

const generateToken = (): string => {
  const bytes = new Uint8Array(TOKEN_BYTES)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

const hashToken = (token: string): string =>
  encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
