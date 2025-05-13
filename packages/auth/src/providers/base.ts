export interface ProviderUserData {
  accountId: string
  name: string
  email: string
  image: string
}

export abstract class BaseProvider {
  protected abstract provider: unknown

  protected abstract readonly API_URL: string
  protected abstract readonly DEFAULT_SCOPES: string[]

  abstract createAuthorizationURL(
    state: string,
    codeVerifier: string | null,
  ): URL

  abstract fetchUserData(
    code: string,
    codeVerifier: string | null,
  ): Promise<ProviderUserData>

  protected createCallbackUrl(provider: string) {
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${process.env.PORT ?? 3000}`
    return `${baseUrl}/api/auth/${provider}/callback`
  }
}
