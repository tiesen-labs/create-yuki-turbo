export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (import.meta.env.PROD) return 'https://create-yuki-turbo.vercel.app'
  return `http://localhost:3001`
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
