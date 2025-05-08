'use server'

import { db, eq } from '@yuki/db'
import { accounts, users } from '@yuki/db/schema'

import type { AuthParams, Handler, SessionResult } from '../types'
import { getCookie, setCookie } from './cookies'
import { verify } from './password'
import { createSession, invalidateToken, validateToken } from './session'

const SESSION_COOKIE_NAME = 'auth_token'

/**
 * Authentication utility that validates session tokens and provides authenticated handlers
 *
 * @description
 * This function has two modes of operation:
 * 1. Direct authentication: Pass a Request or nothing to validate a session token
 * 2. Handler creation: Pass a callback to create an authentication middleware handler
 *
 * @example
 * // Direct authentication
 * const session = await auth(request);
 * if (!session.user) return new Response('Unauthorized', { status: 401 });
 *
 * @example
 * // Create authenticated handler
 * export const GET = auth(({ req, session }) => {
 *   if (!session.user) return new Response('Unauthorized', { status: 401 });
 *   return new Response('Protected data');
 * });
 */
async function auth(params?: Request): Promise<SessionResult>
async function auth(
  params: (params: {
    req: Request
    session: SessionResult
  }) => Response | Promise<Response>,
): Promise<Handler>
async function auth(
  params?: AuthParams,
): Promise<SessionResult | Response | Handler> {
  if (typeof params === 'function') {
    return async (req: Request) => {
      const token =
        (await getCookie(SESSION_COOKIE_NAME, req)) ??
        req.headers.get('Authorization')?.replace(' Bearer ', '') ??
        ''
      const session = await validateToken(token)
      return params({ req, session })
    }
  }

  const token =
    (await getCookie(SESSION_COOKIE_NAME, params)) ??
    params?.headers.get('Authorization')?.replace(' Bearer ', '') ??
    ''

  return validateToken(token)
}

/**
 * Signs in a user with email and password
 *
 * @description
 * Authenticates a user by their email and password. If successful, creates a session
 * by making a request to the sign-in API endpoint.
 *
 * @example
 * // Sign in a user
 * await signIn({ email: 'user@example.com', password: 'password123' });
 *
 * @throws {Error} If the email or password is invalid
 */
async function signIn(input: {
  email: string
  password: string
  skipSetCookie?: boolean
}): Promise<string> {
  const [user] = await db
    .select({ id: users.id, password: users.password })
    .from(users)
    .where(eq(users.email, input.email))

  if (!user?.password || !verify(input.password, user.password))
    throw new Error('Invalid email or password')

  const sessionCookie = await createSession(user.id)

  if (!input.skipSetCookie)
    await setCookie('auth_token', sessionCookie.sessionToken, {
      expires: sessionCookie.expires,
    })

  return `auth_token=${sessionCookie.sessionToken}; Expires=${sessionCookie.expires.toUTCString()}; Path=/; HttpOnly; Secure; SameSite=Lax`
}

/**
 * Signs out the current user by invalidating their session
 *
 * @description
 * Retrieves the session token from cookies and invalidates it if present.
 *
 * @example
 * // Sign out the current user
 * await signOut();
 *
 * @example
 * // Sign out with a specific request context
 * await signOut(request);
 */
async function signOut(req?: Request): Promise<void> {
  const token = await getCookie(SESSION_COOKIE_NAME, req)
  if (token) await invalidateToken(token)
}

/**
 * Creates a new user or links accounts for existing users
 *
 * @description
 * Creates a user account based on OAuth provider data. If an account with the
 * same provider and providerAccountId exists, returns the associated user.
 * If a user with the same email exists, links the new provider to that user.
 * Otherwise creates a new user with the provider account linked.
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

  const existingUser = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  })
  if (existingUser) {
    await db.insert(accounts).values({
      provider,
      providerAccountId,
      userId: existingUser.id,
    })
    return existingUser
  }

  return await db.transaction(async (tx) => {
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
