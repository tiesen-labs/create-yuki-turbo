import { createCookie, data, redirect } from 'react-router'

import { Discord, generateState, lucia, OAuth2RequestError } from '@yuki/auth/lucia'
import { db } from '@yuki/db'

import type { Route } from './+types/api.auth.$'
import { env } from '@/env'
import { getBaseUrl } from '@/lib/utils'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const [provider, isCallback] = params['*'].split('/')

  let oauthProvider = null
  if (provider === 'discord')
    oauthProvider = new Discord(
      env.DISCORD_CLIENT_ID,
      env.DISCORD_CLIENT_SECRET,
      `${getBaseUrl()}/api/auth/${provider}/callback`,
    )
  if (!oauthProvider) return data({ message: 'Provider is invalid' }, { status: 500 })

  const oauth_state = createCookie('oauth_state', {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  })

  if (!isCallback) {
    const state = generateState()
    const scopes = ['email', 'identify']
    const url = oauthProvider.createAuthorizationURL(state, scopes)
    return redirect(url.toString(), {
      headers: { 'Set-Cookie': await oauth_state.serialize({ state }) },
    })
  }

  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code') ?? ''
    const state = url.searchParams.get('state') ?? ''
    const storedState = (await oauth_state.parse(request.headers.get('Cookie'))) as {
      state: string
    }
    if (!code || !state || state !== storedState.state) throw new Error('Invalid state')

    const tokens = await oauthProvider.validateAuthorizationCode(code)
    const accessToken = tokens.accessToken()

    const response = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json() as Promise<DiscordUser>)
      .then((user) => ({
        discordId: user.id,
        email: user.email,
        username: user.username,
        name: user.global_name,
        avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
      }))
      .catch(() => {
        throw new Error('Failed to fetch user data from Discord')
      })

    let user = await db.user.findFirst({ where: { discordId: response.discordId } })
    if (!user) user = await db.user.create({ data: response })
    else user = await db.user.update({ where: { discordId: response.discordId }, data: response })

    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)

    return redirect('/', {
      headers: { 'Set-Cookie': sessionCookie.serialize() },
    })
  } catch (e) {
    if (e instanceof OAuth2RequestError)
      return data({ error: e.message }, { status: Number(e.code) })
    else if (e instanceof Error) return data({ error: e.message }, { status: 500 })
    else return data({ error: 'An unknown error occurred' }, { status: 500 })
  }
}

interface DiscordUser {
  id: string
  email: string
  username: string
  global_name: string
  avatar: string
}
