import { env } from '@/env'

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`
  // eslint-disable-next-line no-restricted-properties
  return `http://localhost:${process.env.PORT ?? 3001}`
}

export const getAuthToken = (headerCookie: string | null) => {
  const cookies: Record<string, string> = {}
  headerCookie?.split(';').forEach((cookie) => {
    const [name, ...valueParts] = cookie.split('=')
    const key = String(name).trim()
    const value = valueParts.join('=').trim()
    if (key && value) cookies[key] = value
  })

  return cookies.auth_session ?? null
}
