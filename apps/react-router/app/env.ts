import { createEnv } from '@t3-oss/env-core'
import { vercel } from '@t3-oss/env-core/presets'
import { z } from 'zod'

export const env = createEnv({
  extends: [vercel()],
  shared: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string(),
    // SERVERVAR: z.string()

    // VITE default values
    MODE: z.string(),
    BASE_URL: z.string(),
    PROD: z.boolean(),
    DEV: z.boolean(),
    SSR: z.boolean(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  clientPrefix: 'VITE_',
  client: {
    // VITE_CLIENTVAR: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  runtimeEnv: {
    ...import.meta.env,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,

    // VITE_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === 'lint',
})
