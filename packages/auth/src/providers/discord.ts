import { Discord } from 'arctic'

import { BaseProvider, getCallbackUrl } from './base'

export class DiscordProvider extends BaseProvider {
  protected provider: Discord

  constructor(clientId: string, clientSecret: string) {
    super()
    this.provider = new Discord(
      clientId,
      clientSecret,
      getCallbackUrl('discord'),
    )
  }

  public createAuthorizationURL(state: string, codeVerifier: string | null) {
    return this.provider.createAuthorizationURL(state, codeVerifier, [
      'identify',
      'email',
    ])
  }

  public async fetchUserData(
    code: string,
    codeVerifier: string | null,
  ): Promise<{
    providerAccountId: string
    providerAccountName: string
    email: string
    image: string
  }> {
    const verifiedCode = await this.provider.validateAuthorizationCode(
      code,
      codeVerifier,
    )
    const token = verifiedCode.accessToken()

    const res = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to fetch user data')

    // @see https://discord.com/developers/docs/resources/user#get-current-user
    const user = (await res.json()) as {
      id: string
      email: string
      username: string
      avatar: string
    }

    return {
      providerAccountId: user.id,
      providerAccountName: user.username,
      email: user.email,
      image: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
    }
  }
}
