'use server'

import { cookies } from 'next/headers'
import { sha256 } from '@oslojs/crypto/sha2'
import { encodeHexLowerCase } from '@oslojs/encoding'
import { Discord } from 'arctic'

import type { Session } from './lib/session'
import { env } from './env'
import { AUTH_KEY } from './lib/constants'
import { validateSessionToken } from './lib/session'

const OAuthConfig = (callbackUrl: string) => ({
  /**
   * OAuth Provider Configuration
   *
   * @remarks
   * - ins: create a new instance for OAuth provider
   * - scopes: authentication permissions for user identification and email
   * - fetchUserUrl: OAuth API endpoint to get user data
   * - mapFn: Maps OAuth user data to database account schema
   *
   * @see https://arcticjs.dev
   */
  discord: {
    ins: new Discord(env.DISCORD_ID, env.DISCORD_SECRET, callbackUrl),
    scopes: ['identify', 'email'],
    fetchUserUrl: 'https://discord.com/api/users/@me',
    mapFn: (data: { id: string; email: string; username: string; avatar: string }) => ({
      providerId: data.id,
      email: data.email,
      name: data.username,
      image: `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`,
    }),
  },
})

const auth = async (req?: Request): Promise<Session> => {
  const token =
    req?.headers
      .get('cookie')
      ?.split(';')
      .find((c) => c.trim().startsWith(`${AUTH_KEY}=`))
      ?.split('=')[1] ??
    (await cookies()).get(AUTH_KEY)?.value ??
    ''
  if (!token) return { expires: new Date(Date.now()) }
  return validateSessionToken(token)
}

const generateGravatar = (email: string): string =>
  encodeHexLowerCase(sha256(new TextEncoder().encode(email)))

export { auth, OAuthConfig, generateGravatar }
export type { Session }
