import type { OAuth2Tokens } from 'arctic'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { generateCodeVerifier, generateState, OAuth2RequestError } from 'arctic'

import type { User } from '@yuki/db'
import { db } from '@yuki/db'
import { env } from '@yuki/env'

import type { SessionResult } from './session'
import { Password } from './password'
import { Session } from './session'

type Providers = Record<
  string,
  {
    createAuthorizationURL: (state: string, codeVerifier: string) => URL
    validateAuthorizationCode: (
      code: string,
      codeVerifier: string,
    ) => Promise<OAuth2Tokens>
    fetchUserUrl: string
    mapUser: (user: never) => {
      provider: string
      providerAccountId: string
      providerAccountName: string
      email: string
      image: string
    }
  }
>

export interface AuthOptions<T extends Providers = Providers> {
  cookieKey: string
  providers: T
}

export class Auth<TProviders extends Providers> {
  private readonly db: typeof db
  private readonly session: Session
  private readonly password: Password

  private readonly COOKIE_KEY: string
  private readonly providers: TProviders

  constructor(options: AuthOptions<TProviders>) {
    this.COOKIE_KEY = options.cookieKey
    this.providers = options.providers

    this.db = db
    this.session = new Session()
    this.password = new Password()
  }

  public async auth(req?: Request): Promise<SessionResult> {
    const authToken = await this.getCookieValue(req)
    if (!authToken) return { expires: new Date() }
    return await this.session.validateSessionToken(authToken)
  }

  public async handlers(req: Request): Promise<Response> {
    const url = new URL(req.url)

    let response: Response = Response.json(
      { error: 'Not found' },
      { status: 404 },
    )

    try {
      if (req.method === 'OPTIONS') {
        response = Response.json('', { status: 204 })
      } else if (req.method === 'GET') {
        response = await this.handleGetRequests(req, url)
      } else if (
        req.method === 'POST' &&
        url.pathname === '/api/auth/sign-out'
      ) {
        await this.signOut(req)
        response = new Response('', {
          headers: new Headers({ Location: '/' }),
          status: 302,
        })
        response.headers.set(
          'Set-Cookie',
          `${this.COOKIE_KEY}=; Path=/; Max-Age=0`,
        )
      }
    } catch (error) {
      response = this.handleError(error)
    }

    this.setCorsHeaders(response)
    return response
  }

  public async signIn<TProviderType extends keyof TProviders | 'credentials'>(
    type: TProviderType,
    values?: TProviderType extends 'credentials'
      ? { email: string; password: string }
      : never,
  ): Promise<void> {
    if (type === 'credentials' && values)
      await this.handleCredentialsSignIn(values.email, values.password)
    else redirect(`/api/auth/oauth/${String(type)}`)
  }

  public async signOut(req?: Request): Promise<void> {
    const token = await this.getCookieValue(req)
    if (token) await this.session.invalidateSessionToken(token)
  }

  private async getCookieValue(
    req?: Request,
    key: string = this.COOKIE_KEY,
    isAuthHeader = true,
  ): Promise<string> {
    if (req)
      return (
        req.headers.get('cookie')?.match(new RegExp(`${key}=([^;]+)`))?.[1] ??
        (isAuthHeader ? req.headers.get('Authorization') : '') ??
        ''
      )

    return (await cookies()).get(key)?.value ?? ''
  }

  private async handleCredentialsSignIn(
    email: string,
    password: string,
  ): Promise<void> {
    const user = await this.db.user.findUnique({ where: { email } })
    if (!user) throw new Error('User not found')
    if (!user.password) throw new Error('User has no password')

    const passwordMatch = this.password.verify(password, user.password)
    if (!passwordMatch) throw new Error('Invalid password')

    const session = await this.session.createSession(user.id)
    ;(await cookies()).set(this.COOKIE_KEY, session.sessionToken, {
      httpOnly: true,
      path: '/',
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: session.expires,
    })
  }

  private async handleGetRequests(req: Request, url: URL): Promise<Response> {
    if (url.pathname === '/api/auth') {
      const session = await this.auth(req)
      return Response.json(session)
    }

    if (url.pathname.startsWith('/api/auth/oauth'))
      return await this.handleOAuthRequest(req, url)

    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  private async handleOAuthRequest(req: Request, url: URL): Promise<Response> {
    const isCallback = url.pathname.endsWith('/callback')

    if (!isCallback) return this.handleOAuthStart(url)
    else return await this.handleOAuthCallback(req, url)
  }

  private handleOAuthStart(url: URL): Response {
    const providerName = String(url.pathname.split('/').pop())
    const provider = this.providers[providerName]

    if (!provider)
      return Response.json({ error: 'Provider not supported' }, { status: 404 })

    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const authorizationUrl = provider.createAuthorizationURL(
      state,
      codeVerifier,
    )

    const response = new Response('', {
      headers: new Headers({ Location: authorizationUrl.toString() }),
      status: 302,
    })
    response.headers.append(
      'Set-Cookie',
      `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax`,
    )
    response.headers.append(
      'Set-Cookie',
      `code_verifier=${codeVerifier}; Path=/; HttpOnly; SameSite=Lax`,
    )

    return response
  }

  private async createUser(data: {
    provider: string
    providerAccountId: string
    providerAccountName: string
    email: string
    image: string
  }): Promise<User> {
    const { provider, providerAccountId, providerAccountName, email, image } =
      data

    const existingAccount = await db.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
    })

    if (existingAccount) {
      const user = await db.user.findUnique({
        where: { id: existingAccount.userId },
      })
      if (!user) throw new Error(`Failed to sign in with ${provider}`)
      return user
    }

    const accountData = {
      provider,
      providerAccountId,
      providerAccountName,
    }

    return await db.user.upsert({
      where: { email },
      update: { accounts: { create: accountData } },
      create: {
        email,
        name: providerAccountName,
        image,
        accounts: { create: accountData },
      },
    })
  }

  private async handleOAuthCallback(req: Request, url: URL): Promise<Response> {
    const providerName = String(url.pathname.split('/').slice(-2)[0])
    const provider = this.providers[providerName]

    if (!provider)
      return Response.json({ error: 'Provider not supported' }, { status: 404 })

    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const storedState = await this.getCookieValue(req, 'oauth_state', false)
    const codeVerifier = await this.getCookieValue(req, 'code_verifier', false)

    if (!code || !state || state !== storedState)
      throw new Error('Invalid state')

    const { validateAuthorizationCode, fetchUserUrl, mapUser } = provider
    const verifiedCode = await validateAuthorizationCode(code, codeVerifier)
    const token = verifiedCode.accessToken()

    const res = await fetch(fetchUserUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to fetch user data')

    const user = await this.createUser(mapUser((await res.json()) as never))
    const session = await this.session.createSession(user.id)

    const response = new Response('', {
      headers: new Headers({ Location: '/' }),
      status: 302,
    })
    response.headers.set(
      'Set-Cookie',
      `${this.COOKIE_KEY}=${session.sessionToken}; HttpOnly; Path=/; ${env.NODE_ENV === 'production' ? 'Secure' : ''}; SameSite=Lax`,
    )
    response.headers.append('Set-Cookie', 'oauth_state=; Path=/; Max-Age=0')
    response.headers.append('Set-Cookie', 'code_verifier=; Path=/; Max-Age=0')

    return response
  }

  private handleError(error: unknown): Response {
    if (error instanceof OAuth2RequestError)
      return Response.json(
        { error: error.message, description: error.description },
        { status: 400 },
      )

    if (error instanceof Error)
      return Response.json({ error: error.message }, { status: 400 })

    return Response.json(
      { error: 'An unknown error occurred' },
      { status: 400 },
    )
  }

  private setCorsHeaders(res: Response): void {
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Request-Method', '*')
    res.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST')
    res.headers.set('Access-Control-Allow-Headers', '*')
  }
}
