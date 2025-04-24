import { Discord } from 'arctic'

import { env } from '@yuki/env'

import { BaseProvider } from './base'

export class DiscordProvider extends BaseProvider {
  protected provider = new Discord(
    env.DISCORD_CLIENT_ID,
    env.DISCORD_CLIENT_SECRET,
    this.createCallbackUrl('discord'),
  )

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
    name: string
    email: string
    image: string
  }> {
    const authResults = await this.provider.validateAuthorizationCode(
      code,
      codeVerifier,
    )
    const accessToken = authResults.accessToken()

    const res = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
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
      name: user.username,
      email: user.email,
      image: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
    }
  }
}
