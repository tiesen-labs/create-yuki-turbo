'use server'

import type { AuthOptions } from './core/auth'
import { Auth } from './core/auth'
import { DiscordProvider } from './providers/discord'
import { GoogleProvider } from './providers/google'

const authOptions = {
  cookieKey: 'auth_token',
  providers: {
    /**
     * OAuth2 provider configuration
     *
     * Requirements:
     * - Each provider requires CLIENT_ID and CLIENT_SECRET environment variables
     *   (e.g., DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET)
     *
     * Callback URL:
     * - Set the callback URL for each provider to: {{ BASE_URL }}/api/auth/:provider/callback
     *   (e.g., https://yourdomain.com/api/auth/discord/callback)
     */
    discord: new DiscordProvider(),
    google: new GoogleProvider(),
  },
} satisfies AuthOptions

const authInstance = new Auth(authOptions)

export const handlers = authInstance.handlers.bind(authInstance)
export const signOut = authInstance.signOut.bind(authInstance)
export const auth = authInstance.auth.bind(authInstance)
