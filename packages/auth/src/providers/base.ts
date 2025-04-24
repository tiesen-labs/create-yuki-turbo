import { env } from '@yuki/env'

export abstract class BaseProvider {
  abstract createAuthorizationURL(
    state: string,
    codeVerifier: string | null,
  ): URL

  abstract fetchUserData(
    code: string,
    codeVerifier: string | null,
  ): Promise<{
    providerAccountId: string
    name: string
    email: string
    image: string
  }>

  protected createCallbackUrl(provider: string) {
    const baseUrl = env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : env.VERCEL_URL
        ? `https://${env.VERCEL_URL}`
        : // eslint-disable-next-line no-restricted-properties
          `http://localhost:${process.env.PORT ?? 3000}`
    return `${baseUrl}/api/auth/${provider}/callback`
  }
}
