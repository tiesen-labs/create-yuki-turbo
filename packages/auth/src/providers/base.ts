import { env } from '@yuki/env'

export abstract class BaseProvider {
  protected abstract provider: unknown

  public abstract createAuthorizationURL(
    state: string,
    codeVerifier: string | null,
  ): URL

  public abstract fetchUserData(
    code: string,
    codeVerifier: string | null,
  ): Promise<{
    providerAccountId: string
    providerAccountName: string
    email: string
    image: string
  }>
}

export const getCallbackUrl = (provider: string) => {
  const baseUrl = env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : env.VERCEL_URL
      ? `https://${env.VERCEL_URL}`
      : // eslint-disable-next-line no-restricted-properties
        `http://localhost:${process.env.PORT ?? 3000}`

  return `${baseUrl}/api/auth/oauth/${provider}/callback`
}
