import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'

import type { Session, User } from '@yuki/db'
import { db } from '@yuki/db'

const EXPIRES_IN = 1000 * 60 * 60 * 24 * 30

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

export const createSession = async (
  token: string,
  userId: string,
): Promise<Session> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + EXPIRES_IN),
  }
  await db.session.create({ data: session })
  return session
}

export const validateSessionToken = async (
  token: string,
): Promise<SessionValidation> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const result = await db.session.findUnique({
    where: { id: sessionId },
    include: { user: { include: { accounts: true } } },
  })
  if (!result) return {}

  const { user, ...session } = result
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.session.delete({ where: { id: sessionId } })
    return {}
  }

  if (Date.now() >= session.expiresAt.getTime() - EXPIRES_IN / 2) {
    session.expiresAt = new Date(Date.now() + EXPIRES_IN)
    await db.session.update({
      where: { id: session.id },
      data: { expiresAt: session.expiresAt },
    })
  }

  return { ...session, user }
}

export const invalidateSession = async (sessionId: string): Promise<void> => {
  await db.session.delete({ where: { id: sessionId } })
}

export interface SessionValidation {
  id?: string
  expiresAt?: Date
  user?: User | null
  userId?: string
}
