import { Discord, generateState, GitHub } from 'arctic'

import { db } from '@yuki/db'

export class OAuth {
  private name: string
  private provider: Discord | GitHub
  private scopes: string[]

  constructor(
    provider: string,
    client_id: string,
    client_secret: string,
    callback_url: string,
  ) {
    switch (provider) {
      case 'discord':
        this.name = 'discord'
        this.provider = new Discord(client_id, client_secret, callback_url)
        this.scopes = ['identify', 'email']
        break
      case 'github':
        this.name = 'github'
        this.provider = new GitHub(client_id, client_secret, callback_url)
        this.scopes = ['user:email']
        break
      default:
        throw new Error(`Provider ${provider} not supported`)
    }
  }

  public create() {
    const state = generateState()

    const url =
      this.provider.createAuthorizationURL.length === 3
        ? // @ts-expect-error - This is a hack to make the types work
          this.provider.createAuthorizationURL(state, null, this.scopes)
        : // @ts-expect-error - This is a hack to make the types work
          this.provider.createAuthorizationURL(state, this.scopes)

    return { url, state }
  }

  public async callback(code: string) {
    const tokens =
      this.provider.validateAuthorizationCode.length == 2
        ? await this.provider.validateAuthorizationCode(code, '')
        : // @ts-expect-error - This is a hack to make the types work
          await this.provider.validateAuthorizationCode(code)

    let oauthUser
    switch (this.name) {
      case 'discord':
        oauthUser = await this.discord(tokens.accessToken())
        break
      case 'github':
        oauthUser = await this.github(tokens.accessToken())
        break
      default:
        throw new Error(`Provider ${this.name} not supported`)
    }

    const { email, ...rest } = oauthUser

    const account = await db.account.findFirst({
      where: { AND: { provider: this.name, providerId: rest.providerId } },
    })
    let user = await db.user.findFirst({ where: { email } })

    if (!account && !user)
      user = await db.user.create({
        data: {
          email,
          name: rest.userName,
          avatar: rest.avatar,
          accounts: { create: { ...rest, provider: this.name } },
        },
      })
    else if (!account && user)
      user = await db.user.update({
        where: { email },
        data: { accounts: { create: { ...rest, provider: this.name } } },
      })

    if (!user) throw new Error(`Failed to sign in with ${this.name}`)
    return user
  }

  private async discord(token: string): Promise<fetchedUser> {
    // prettier-ignore
    interface DiscordUser { id: string; email: string; username: string; avatar: string }
    const discordUser = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json() as Promise<DiscordUser>)
      .then((user) => ({
        providerId: user.id,
        email: user.email,
        userName: user.username,
        avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
      }))
      .catch(() => {
        throw new Error('Failed to fetch user data from Discord')
      })

    return discordUser
  }

  private async github(token: string): Promise<fetchedUser> {
    // prettier-ignore
    interface GithubUser { id: string; email: string; login: string; avatar_url: string }
    const githubUser = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json() as Promise<GithubUser>)
      .then((user) => ({
        providerId: user.id.toString(),
        email: user.email,
        userName: user.login,
        avatar: user.avatar_url,
      }))
      .catch(() => {
        throw new Error('Failed to fetch user data from GitHub')
      })

    return githubUser
  }
}

interface fetchedUser {
  providerId: string
  email: string
  userName: string
  avatar: string
}
