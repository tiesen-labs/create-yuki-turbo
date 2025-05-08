'use server'

import { cookies } from 'next/headers'

import { env } from '@yuki/env'

export const getCookie = async (
  key: string,
  req?: Request,
): Promise<string | undefined> => {
  if (req) return parseCookies(req)[key]
  return (await cookies()).get(key)?.value
}

export const setCookie = async (
  key: string,
  value: string,
  options: Record<string, unknown> = {},
  res?: Response,
): Promise<void> => {
  const cookiesAttributes = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: env.NODE_ENV === 'production',
    ...options,
  }

  if (res)
    res.headers.append(
      'set-cookie',
      `${key}=${value}; ${Object.entries(cookiesAttributes)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')}`,
    )
  else (await cookies()).set(key, value, cookiesAttributes)
}

export const deleteCookie = async (
  key: string,
  res?: Response,
): Promise<void> => {
  if (res)
    res.headers.append(
      'set-cookie',
      `${key}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    )
  else (await cookies()).delete(key)
}

const parseCookies = (req: Request): Record<string, string | undefined> => {
  const cookieHeader = req.headers.get('cookie')
  if (!cookieHeader) return {}

  return cookieHeader
    .split(';')
    .reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) acc[key] = decodeURIComponent(value)
      return acc
    }, {})
}
