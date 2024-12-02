import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  shared: {
    BASE_URL: z.string(),
    MODE: z.enum(['development', 'production', 'test']).default('development'),
    DEV: z.boolean(),
    PROD: z.boolean(),
    SSR: z.boolean(),

    VERCEL_URL: z.string().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    // SERVERVAR: z.string()
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `VITE_`.
   */
  clientPrefix: 'VITE_',
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  runtimeEnv: import.meta.env,
  skipValidation: !!import.meta.env.CI || import.meta.env.npm_lifecycle_event === 'lint',
})
