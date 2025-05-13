/**
 * Cookie management utilities for authentication
 *
 * Implements secure cookie handling for authentication sessions following
 * best practices as recommended by Lucia Auth.
 *
 * @see https://lucia-auth.com/sessions/cookies
 */
import { cookies } from 'next/headers'

/**
 * Default cookie options that will be applied to all cookies
 * unless explicitly overridden
 */
const DEFAULT_COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

async function getCookie(
  key: string,
  req?: Request,
): Promise<string | undefined> {
  if (req) {
    const cookies = req.headers
      .get('cookie')
      ?.split(';')
      .reduce((acc: Record<string, string>, cookie) => {
        const [key, value] = cookie.trim().split('=')
        if (key && value) acc[key] = decodeURIComponent(value)
        return acc
      }, {})
    return cookies?.[key]
  }
  return (await cookies()).get(key)?.value
}

async function setCookie(
  key: string,
  value: string,
  options: {
    path?: string
    domain?: string
    maxAge?: number
    expires?: number | Date
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
    [key: string]: unknown
  } = {},
  res?: Response,
): Promise<void> {
  const cookieOptions = {
    ...DEFAULT_COOKIE_OPTIONS,
    ...options,
  }

  if (res) {
    // Format Date objects to UTC string if present
    if (cookieOptions.expires instanceof Date)
      cookieOptions.expires = cookieOptions.expires.toUTCString() as never

    const cookieString = `${key}=${value}; ${Object.entries(cookieOptions)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')}`
    res.headers.append('set-cookie', cookieString)
  } else (await cookies()).set(key, value, cookieOptions)
}

async function deleteCookie(key: string, res?: Response): Promise<void> {
  if (res)
    res.headers.append(
      'set-cookie',
      `${key}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    )
  else (await cookies()).delete(key)
}

export { getCookie, setCookie, deleteCookie }
