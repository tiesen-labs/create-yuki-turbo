'use server'

import { Discord, Google } from 'arctic'

import { env } from '@yuki/env'

import type { AuthOptions } from './core/auth'
import { Auth } from './core/auth'

const getCallbackUrl = (provider: string) => {
  const baseUrl = env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : env.VERCEL_URL
      ? `https://${env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT ?? 3000}`

  return `${baseUrl}/api/auth/oauth/${provider}/callback`
}

const discord = new Discord(
  env.DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  getCallbackUrl('discord'),
)

const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  getCallbackUrl('google'),
)

const authOptions = {
  cookieKey: 'auth_token',
  providers: {
    discord: {
      createAuthorizationURL: (state, codeVerifier) =>
        discord.createAuthorizationURL(state, codeVerifier, [
          'identify',
          'email',
        ]),
      validateAuthorizationCode: (code, codeVerifier) =>
        discord.validateAuthorizationCode(code, codeVerifier),
      fetchUserUrl: 'https://discord.com/api/users/@me',
      mapUser: (user: {
        id: string
        email: string
        username: string
        avatar: string
      }) => ({
        provider: 'discord',
        providerAccountId: user.id,
        providerAccountName: user.username,
        email: user.email,
        image: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
      }),
    },
    google: {
      createAuthorizationURL: (state, codeVerifier) =>
        google.createAuthorizationURL(state, codeVerifier, [
          'openid',
          'profile',
          'email',
        ]),
      validateAuthorizationCode: (code, codeVerifier) =>
        google.validateAuthorizationCode(code, codeVerifier),
      fetchUserUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
      mapUser: (user: {
        sub: string
        email: string
        name: string
        picture: string
      }) => ({
        provider: 'google',
        providerAccountId: user.sub,
        providerAccountName: user.name,
        email: user.email,
        image: user.picture,
      }),
    },
  },
} satisfies AuthOptions

const authInstance = new Auth(authOptions)

export const handlers = authInstance.handlers.bind(authInstance)
export const signOut = authInstance.signOut.bind(authInstance)
export const auth = authInstance.auth.bind(authInstance)
