'use server'

import { env } from '@yuki/env'

import type { AuthOptions } from './core/auth'
import { Auth } from './core/auth'
import { DiscordProvider } from './providers/discord'
import { GoogleProvider } from './providers/google'

const authOptions = {
  cookieKey: 'auth_token',
  providers: {
    discord: new DiscordProvider(
      env.DISCORD_CLIENT_ID,
      env.DISCORD_CLIENT_SECRET,
    ),
    google: new GoogleProvider(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET),
  },
} satisfies AuthOptions

const authInstance = new Auth(authOptions)

export const handlers = authInstance.handlers.bind(authInstance)
export const signOut = authInstance.signOut.bind(authInstance)
export const auth = authInstance.auth.bind(authInstance)
