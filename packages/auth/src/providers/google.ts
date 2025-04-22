import { Google } from 'arctic'

import { env } from '@yuki/env'

import { BaseProvider } from './base'

export class GoogleProvider extends BaseProvider {
  protected provider = new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    this.getCallbackUrl('google'),
  )

  public createAuthorizationURL(state: string, codeVerifier: string | null) {
    return this.provider.createAuthorizationURL(state, codeVerifier ?? '', [
      'openid',
      'profile',
      'email',
    ])
  }

  public async fetchUserData(
    code: string,
    codeVerifier: string | null,
  ): Promise<{
    providerAccountId: string
    name: string
    email: string
    image: string
  }> {
    const authResults = await this.provider.validateAuthorizationCode(
      code,
      codeVerifier ?? '',
    )
    const accessToken = authResults.accessToken()

    const res = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (!res.ok) throw new Error('Failed to fetch user data')

    // @see https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo
    const user = (await res.json()) as {
      sub: string
      email: string
      name: string
      picture: string
    }

    return {
      providerAccountId: user.sub,
      name: user.name,
      email: user.email,
      image: user.picture,
    }
  }
}
