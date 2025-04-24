import type { Config } from 'drizzle-kit'

import { env } from '@yuki/env'

const nonPoolingUrl = env.DATABASE_URL.replace('-pooler', '')

export default {
  schema: './src/schema',
  out: './src/schema/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: nonPoolingUrl },
} satisfies Config
