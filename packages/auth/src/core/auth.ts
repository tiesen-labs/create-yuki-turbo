import { generateCodeVerifier, generateState } from 'arctic'

import { env } from '@yuki/env'

import type { AuthOptions, Providers } from '../types'
import { SESSION_COOKIE_NAME } from '../config'
import { auth, createUser, signIn, signOut } from './actions'
import { deleteCookie, getCookie, setCookie } from './cookies'
import { createSession } from './session'
import { createRedirectResponse, setCorsHeaders } from './utils'

/**
 * Creates an authentication handler with OAuth providers
 *
 * @description
 * The Auth function creates a complete authentication system with OAuth providers.
 * It handles OAuth flows (start and callback), session management, and provides
 * API handlers for authentication operations.
 *
 * @param providers - Configuration object containing OAuth provider settings
 *
 * @returns Authentication handlers and utility functions:
 *  - auth: Function to verify authentication status
 *  - signIn: Function to authenticate users
 *  - signOut: Function to end user sessions
 *  - handlers: HTTP handlers for auth routes (GET/POST)
 *
 * @example
 * ```typescript
 * const authHandler = Auth({
 *   google: new Google({
 *     clientId: env.GOOGLE_CLIENT_ID,
 *     clientSecret: env.GOOGLE_CLIENT_SECRET,
 *     redirectUri: `${env.AUTH_URL}/api/auth/google/callback`,
 *   }),
 * })
 *
 * // Use in API route
 * export const { GET, POST } = authHandler.handlers
 * ```
 */
export function Auth<TProviders extends Providers>(
  providers: AuthOptions<TProviders>,
) {
  const handleOAuthStart = async (req: Request): Promise<Response> => {
    const url = new URL(req.url)
    const redirectTo = url.searchParams.get('redirect_to') ?? '/'

    const providerName = String(url.pathname.split('/').pop())
    const provider = providers[providerName]
    if (!provider) throw new Error(`Provider ${providerName} is not supported`)

    if (redirectTo.startsWith('exp://') && env.NODE_ENV === 'development') {
      if (!env.AUTH_PROXY_URL) throw new Error('AUTH_PROXY_URL is not set')

      const redirectUrl = new URL(
        `https://${env.AUTH_PROXY_URL}${url.pathname}`,
      )
      redirectUrl.searchParams.set('redirect_to', redirectTo)
      return createRedirectResponse(redirectUrl)
    }

    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const authorizationUrl = provider.createAuthorizationURL(
      state,
      codeVerifier,
    )

    const response = createRedirectResponse(authorizationUrl)
    await setCookie('auth_state', state, { maxAge: 60 * 5 }, response)
    await setCookie('code_verifier', codeVerifier, { maxAge: 60 * 5 }, response)
    await setCookie('redirect_to', redirectTo, { maxAge: 60 * 5 }, response)
    return response
  }

  const handleOAuthCallback = async (req: Request): Promise<Response> => {
    const url = new URL(req.url)
    const providerName = String(url.pathname.split('/').slice(-2, -1))
    const provider = providers[providerName]
    if (!provider) throw new Error(`Provider ${providerName} is not supported`)

    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const storedState = await getCookie('auth_state', req)
    const storedCode = await getCookie('code_verifier', req)
    const redirectTo = (await getCookie('redirect_to', req)) ?? '/'

    if (!code || !state || !storedState || !storedCode)
      throw new Error('Missing required parameters')

    const userData = await provider.fetchUserData(code, storedCode)
    const user = await createUser({ ...userData, provider: providerName })
    const sessionCookie = await createSession(user.id)

    const redirectUrl = new URL(redirectTo, req.url)
    if (redirectUrl.origin !== url.origin)
      redirectUrl.searchParams.set('token', sessionCookie.sessionToken)

    const response = createRedirectResponse(redirectUrl)
    await setCookie(
      SESSION_COOKIE_NAME,
      sessionCookie.sessionToken,
      { expires: sessionCookie.expires.toUTCString() },
      response,
    )
    await deleteCookie('auth_state', response)
    await deleteCookie('code_verifier', response)
    await deleteCookie('redirect_to', response)

    return response
  }

  return {
    auth,
    signIn,
    signOut,
    handlers: {
      GET: async (req: Request) => {
        const url = new URL(req.url)
        const pathName = url.pathname

        let response = new Response('Not Found', { status: 404 })

        try {
          if (pathName === '/api/auth') {
            const session = await auth(req)
            if (session.user)
              session.user.password = undefined as unknown as null
            response = Response.json(session)
          } else {
            const isCallback = url.pathname.endsWith('/callback')
            if (isCallback) response = await handleOAuthCallback(req)
            else response = await handleOAuthStart(req)
          }
        } catch (e) {
          if (e instanceof Error) {
            response = new Response(e.message, { status: 500 })
          } else {
            response = new Response('Internal Server Error', { status: 500 })
          }
        }

        setCorsHeaders(response)
        return response
      },
      POST: async (req: Request) => {
        const { pathname } = new URL(req.url)
        let response = new Response('Not Found', { status: 404 })

        if (pathname === '/api/auth/sign-in') {
          const json = (await req.json()) as { email: string; password: string }
          try {
            const { sessionToken, expires } = await signIn(json)
            response = Response.json({ token: sessionToken }, { status: 200 })
            await setCookie(
              SESSION_COOKIE_NAME,
              sessionToken,
              { expires: expires.toUTCString() },
              response,
            )
          } catch (e) {
            if (e instanceof Error)
              response = Response.json({ error: e.message }, { status: 401 })
            else
              response = Response.json(
                { error: 'Internal Server Error' },
                { status: 500 },
              )
          }
        } else if (pathname === '/api/auth/sign-out') {
          await signOut(req)
          response = createRedirectResponse('/')
          await deleteCookie(SESSION_COOKIE_NAME, response)
        }

        setCorsHeaders(response)
        return response
      },
    },
  }
}
