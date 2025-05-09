'use server'

import { db, eq } from '@yuki/db'
import { accounts, users } from '@yuki/db/schema'

import type { SessionResult } from '../types'
import { SESSION_COOKIE_NAME } from '../config'
import { getCookie } from './cookies'
import { verify } from './password'
import { createSession, invalidateToken, validateToken } from './session'

/**
 * Extracts the session token from a request
 *
 * @param request - Optional request object to extract token from
 * @returns The session token or empty string if not found
 * @internal
 */
async function getSessionToken(request?: Request): Promise<string> {
  return (
    (await getCookie(SESSION_COOKIE_NAME, request)) ??
    request?.headers.get('Authorization')?.replace('Bearer ', '') ??
    ''
  )
}

/**
 * Authenticates a request by validating the session token
 *
 * @param request - Optional request object to extract the session token from
 * @returns Promise resolving to a SessionResult with user information if authenticated
 *
 * @example
 * // Authenticate the current request
 * const session = await auth();
 *
 * @example
 * // Authenticate with a specific request
 * const session = await auth(request);
 */
async function auth(request?: Request): Promise<SessionResult> {
  const token = await getSessionToken(request)
  return validateToken(token)
}

/**
 * Signs in a user with email and password
 *
 * @param input - Object containing email and password credentials
 * @returns Object containing the session token and expiration date
 * @throws Error if credentials are invalid or authentication fails
 *
 * @example
 * // Sign in a user
 * try {
 *   const session = await signIn({ email: 'user@example.com', password: 'password123' });
 * } catch (error) {
 *   // Handle authentication failure
 * }
 */
async function signIn(input: {
  email: string
  password: string
}): Promise<{ sessionToken: string; expires: Date }> {
  const [user] = await db
    .select({ id: users.id, password: users.password })
    .from(users)
    .where(eq(users.email, input.email))

  if (!user?.password || !verify(input.password, user.password))
    throw new Error('Invalid email or password')

  return createSession(user.id)
}

/**
 * Signs out the current user by invalidating their session
 *
 * @param request - Optional Request object to extract the session token from
 * @returns Promise that resolves when the session is invalidated
 *
 * @example
 * // Sign out the current user
 * await signOut();
 *
 * @example
 * // Sign out with a specific request context
 * await signOut(request);
 */
async function signOut(request?: Request): Promise<void> {
  const token = await getSessionToken(request)
  if (token) await invalidateToken(token)
}

/**
 * Creates a new user or links accounts for existing users
 *
 * @description
 * This function has three possible outcomes:
 * 1. Return existing user if the provider account is already linked
 * 2. Link new provider to existing user with matching email
 * 3. Create new user and link provider account
 *
 * @param data - User data including provider details, name, email, and image
 * @returns The created or existing user object
 * @throws Error if user creation fails
 *
 * @example
 * // Create user from OAuth data
 * const user = await createUser({
 *   provider: 'google',
 *   providerAccountId: '123456',
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   image: 'https://example.com/avatar.png'
 * });
 */
async function createUser(data: {
  provider: string
  providerAccountId: string
  name: string
  email: string
  image: string
}): Promise<typeof users.$inferSelect> {
  const { provider, providerAccountId, email } = data

  const existingAccount = await db.query.accounts.findFirst({
    where: (accounts, { and, eq }) =>
      and(
        eq(accounts.provider, provider),
        eq(accounts.providerAccountId, providerAccountId),
      ),
    with: { user: true },
  })
  if (existingAccount?.user) return existingAccount.user

  return await db.transaction(async (tx) => {
    const existingUser = await tx.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    })

    if (existingUser) {
      await tx.insert(accounts).values({
        provider,
        providerAccountId,
        userId: existingUser.id,
      })
      return existingUser
    }

    const [newUser] = await tx.insert(users).values(data).returning()
    if (!newUser) throw new Error('Failed to create user')

    await tx.insert(accounts).values({
      provider,
      providerAccountId,
      userId: newUser.id,
    })

    return newUser
  })
}

export { auth, signIn, signOut, createUser }
