import type { AuthOptions } from './types'
import { DiscordProvider } from './providers/discord'
import { GoogleProvider } from './providers/google'

/**
 * Authentication configuration
 *
 * @remarks
 * Each provider requires CLIENT_ID and CLIENT_SECRET environment variables
 * (e.g., DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET)
 *
 * Callback URL should be set to: {{ BASE_URL }}/api/auth/:provider/callback
 * (e.g., https://yourdomain.com/api/auth/discord/callback)
 */
export const authOptions = {
  discord: new DiscordProvider(),
  google: new GoogleProvider(),
} satisfies AuthOptions
