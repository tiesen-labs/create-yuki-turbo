import type { User } from '@prisma/client'
import type { OAuth2Tokens } from 'arctic'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { generateCodeVerifier, generateState } from 'arctic'
import { z } from 'zod'

import { db } from '@yuki/db'

import type { SessionResult } from './session'
import { env } from '../env'
import { Password } from './password'
import { Session } from './session'

export interface AuthOptions {
  providers: Providers
}

type SignInType = 'credentials' | 'discord' | 'google'

class AuthClass {
  private readonly db: typeof db
  private readonly session: Session
  private readonly password: Password
  private readonly COOKIE_KEY: string

  private readonly providers: Providers

  constructor(options: AuthOptions) {
    this.COOKIE_KEY = 'auth_token'

    this.providers = options.providers

    this.db = db
    this.session = new Session()
    this.password = new Password()
  }

  public async auth(req?: Request): Promise<SessionResult> {
    let authToken: string | undefined

    if (req) {
      const cookies = this.parsedCookies(req.headers)
      authToken =
        cookies[this.COOKIE_KEY] ??
        req.headers.get('Authorization')?.replace('Bearer ', '')
    } else {
      authToken = (await cookies()).get(this.COOKIE_KEY)?.value
    }

    if (!authToken) return { expires: new Date() }

    return await this.session.validateSessionToken(authToken)
  }

  public async handlers(req: Request): Promise<Response> {
    const url = new URL(req.url)

    let response: Response = new Response('Not found', { status: 404 })

    switch (req.method) {
      case 'OPTIONS':
        response = new Response('', { status: 204 })
        break
      case 'GET':
        if (url.pathname === '/api/auth') {
          const session = await this.auth(req)
          response = new Response(JSON.stringify(session))
        } else if (url.pathname.startsWith('/api/auth/oauth')) {
          const isCallback = url.pathname.endsWith('/callback')

          if (!isCallback) {
            const provider = String(url.pathname.split('/').pop())
            const state = generateState()
            const codeVerifier = generateCodeVerifier()
            const authorizationUrl = this.providers[
              provider
            ]?.createAuthorizationURL(state, codeVerifier)

            if (!authorizationUrl) {
              response = new Response('Provider not found', { status: 404 })
            } else {
              response = new Response('', { status: 302 })
              response.headers.set('Location', authorizationUrl.toString())
              response.headers.set('Set-Cookie', `oauth_state=${state}; Path=/`)

              this.setCookie(response, 'oauth_state', state, { maxAge: 600 })
              this.setCookie(response, 'code_verifier', codeVerifier, {
                maxAge: 600,
              })
            }
          } else {
            const cookies = this.parsedCookies(req.headers)

            const provider = String(url.pathname.split('/').slice(-2)[0])
            const code = url.searchParams.get('code')
            const state = url.searchParams.get('state')
            const storedState = cookies.oauth_state
            const codeVerifier = cookies.code_verifier ?? ''

            try {
              if (!code || !state || state !== storedState)
                throw new Error('Invalid state')

              const { validateAuthorizationCode, fetchUserUrl, mapUser } =
                this.providers[provider] ?? {}
              if (!validateAuthorizationCode || !fetchUserUrl || !mapUser)
                throw new Error('Provider not found')

              const verifiedCode = await validateAuthorizationCode(
                code,
                codeVerifier,
              )

              const token = verifiedCode.accessToken()

              const res = await fetch(fetchUserUrl, {
                headers: { Authorization: `Bearer ${token}` },
              })
              if (!res.ok)
                throw new Error(`Failed to fetch user data from ${provider}`)

              const user = await this.createUser(
                mapUser((await res.json()) as never),
              )
              const session = await this.session.createSession(user.id)

              response = new Response('', { status: 302 })

              response.headers.set('Location', '/')
              this.setCookie(response, this.COOKIE_KEY, session.sessionToken, {
                expires: session.expires,
                replace: true,
              })

              const pastDate = new Date(0)
              this.setCookie(response, 'oauth_state', '', { expires: pastDate })
              this.setCookie(response, 'code_verifier', '', {
                expires: pastDate,
              })
            } catch (error) {
              if (error instanceof Error)
                response = new Response(
                  JSON.stringify({ error: error.message }),
                  {
                    status: 400,
                  },
                )
              else
                response = new Response(
                  JSON.stringify({ error: 'An error occurred' }),
                  {
                    status: 500,
                  },
                )
            }
          }
        }
        break
      case 'POST':
        if (url.pathname === '/api/auth/sign-out') {
          await this.signOut(req)
          response = new Response('', { status: 302 })
          response.headers.set('Location', '/')
          this.setCookie(response, this.COOKIE_KEY, '', {
            expires: new Date(0),
          })
        }
        break
    }

    this.setCorsHeaders(response)
    return response
  }

  public async signIn(
    type: SignInType,
    data?: z.infer<typeof credentialsSchema>,
  ): Promise<
    | { success: false; fieldErrors: Record<string, string[]> }
    | { success: true; session: { sessionToken: string; expires: Date } }
    | undefined
  > {
    if (type === 'credentials') {
      const parsedData = credentialsSchema.safeParse(data)
      if (!parsedData.success)
        return {
          success: false,
          fieldErrors: parsedData.error.flatten().fieldErrors,
        }

      const { email, password } = parsedData.data

      const user = await this.db.user.findUnique({ where: { email } })
      if (!user) throw new Error('User not found')
      if (!user.password) throw new Error('User has no password')

      const passwordMatch = this.password.verify(password, user.password)
      if (!passwordMatch) throw new Error('Invalid password')

      return {
        success: true,
        session: await this.session.createSession(user.id),
      }
    } else {
      redirect(`/api/auth/oauth/${type}`)
    }
  }

  public async signOut(req?: Request): Promise<void> {
    let token: string

    if (req) {
      const cookies = this.parsedCookies(req.headers)
      token =
        cookies[this.COOKIE_KEY] ??
        req.headers.get('Authorization')?.replace('Bearer ', '') ??
        ''
    } else {
      token = (await cookies()).get(this.COOKIE_KEY)?.value ?? ''
    }

    await this.session.invalidateSessionToken(token)
    if (!req) (await cookies()).delete(this.COOKIE_KEY)
  }

  private parsedCookies(headers: Headers): Record<string, string> {
    const cookiesHeader = headers.get('cookie')
    if (!cookiesHeader) return {}

    return cookiesHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.split('=') as [string, string]
      return { ...acc, [name.trim()]: value }
    }, {})
  }

  private setCookie(
    response: Response,
    name: string,
    value: string,
    options: {
      expires?: Date
      maxAge?: number
      replace?: boolean
    } = {},
  ): void {
    const { expires, maxAge, replace = false } = options

    let cookieValue = `${name}=${value}; HttpOnly; Path=/; SameSite=Lax`

    if (expires) cookieValue += `; Expires=${expires.toUTCString()}`
    else if (maxAge !== undefined) cookieValue += `; Max-Age=${maxAge}`

    if (env.NODE_ENV === 'production') cookieValue += '; Secure'

    if (replace) response.headers.set('Set-Cookie', cookieValue)
    else response.headers.append('Set-Cookie', cookieValue)
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

  private setCorsHeaders(res: Response): void {
    res.headers.set('Content-Type', 'application/json')
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Request-Method', '*')
    res.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST')
    res.headers.set('Access-Control-Allow-Headers', '*')
  }
}

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

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    ),
})

export const Auth = (options: AuthOptions) => {
  const authInstance = new AuthClass(options)

  return {
    auth: (req?: Request) => authInstance.auth(req),
    signIn: (type: SignInType, data?: z.infer<typeof credentialsSchema>) =>
      authInstance.signIn(type, data),
    signOut: (req?: Request) => authInstance.signOut(req),
    handlers: (req: Request) => authInstance.handlers(req),
  }
}
