import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const authEnv = createEnv({
  server: {
    DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID is required'),
    DISCORD_CLIENT_SECRET: z.string().min(1, 'DISCORD_CLIENT_SECRET is required'),
    NODE_ENV: z.enum(['development', 'production']).optional(),
  },
  client: {},
  experimental__runtimeEnv: {},
  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === 'lint',
})
