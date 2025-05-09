'use server'

/**
 * Session management service for authentication
 *
 * This module implements secure session handling following patterns from Lucia Auth.
 * It uses cryptographic best practices for token generation, secure storage with
 * database hashing, and automatic session refresh.
 *
 * @see https://lucia-auth.com/sessions/basic-api/drizzle-orm
 */
import { sha256 } from '@oslojs/crypto/sha2'
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding'

import { db, eq } from '@yuki/db'
import { sessions, users } from '@yuki/db/schema'

import type { SessionResult } from '../types'
import {
  SESSION_EXPIRATION,
  SESSION_REFRESH_THRESHOLD,
  TOKEN_BYTES,
} from '../config'

/**
 * Creates a new session for a user
 *
 * Generates a cryptographically secure random token, hashes it for database
 * storage, and creates a session record associated with the user. Only the
 * hash is stored in the database while the original token is returned to be
 * set as a cookie or passed to the client.
 *
 * @param userId - The unique identifier of the user
 * @returns Object containing the unhashed session token and expiration date
 * @throws Error if session creation fails
 */
async function createSession(
  userId: string,
): Promise<{ sessionToken: string; expires: Date }> {
  // Generate a secure random token and hash it for storage
  const token = generateToken()
  const sessionToken = hashToken(token)
  const expires = new Date(Date.now() + SESSION_EXPIRATION)

  // Store the hashed token in the database
  const [session] = await db
    .insert(sessions)
    .values({ sessionToken, expires, userId })
    .returning()

  if (!session) throw new Error('Failed to create session')

  // Return the unhashed token to the client along with expiration
  return { sessionToken: token, expires: session.expires }
}

/**
 * Validates a session token and refreshes it if needed
 *
 * Follows the session validation pattern recommended by Lucia Auth:
 * 1. Hash the provided token
 * 2. Look up the session by hashed token
 * 3. Check if session has expired and delete if necessary
 * 4. Refresh the session if it's beyond the refresh threshold
 *
 * @param token - The unhashed session token to validate
 * @returns Session result containing user data if valid, or just expiration if invalid
 */
async function validateToken(token: string): Promise<SessionResult> {
  const sessionToken = hashToken(token)

  // Lookup the session and associated user in the database
  const [result] = await db
    .select({
      sessionToken: sessions.sessionToken,
      expires: sessions.expires,
      user: users,
    })
    .from(sessions)
    .where(eq(sessions.sessionToken, sessionToken))
    .innerJoin(users, eq(users.id, sessions.userId))

  // Return early if session not found
  if (!result) return { expires: new Date() }

  const { user, ...session } = result
  const now = Date.now()

  // Check if session has expired
  if (now > session.expires.getTime()) {
    await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken))
    return { expires: new Date() }
  }

  // Refresh session if it's beyond the refresh threshold
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

/**
 * Invalidates a specific session token
 *
 * @param token - The unhashed session token to invalidate
 */
async function invalidateToken(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.sessionToken, hashToken(token)))
}

/**
 * Invalidates all sessions for a specific user
 *
 * @param userId - The unique identifier of the user
 */
async function invalidateAllTokens(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId))
}

/**
 * Generates a cryptographically secure random token
 *
 * Uses Web Crypto API to create truly random bytes, then encodes them
 * as a Base32 string (lowercase, no padding) for use in cookies and URLs.
 *
 * @returns Base32-encoded string representation of random bytes
 */
const generateToken = (): string => {
  const bytes = new Uint8Array(TOKEN_BYTES)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

/**
 * Creates a secure hash of a session token
 *
 * Uses SHA-256 to hash the token before storing in the database.
 * This ensures that even if the database is compromised, the original
 * tokens cannot be recovered and used to hijack sessions.
 *
 * @param token - The token to hash
 * @returns Hex-encoded string representation of the SHA-256 hash
 */
const hashToken = (token: string): string =>
  encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

export { createSession, validateToken, invalidateToken, invalidateAllTokens }
