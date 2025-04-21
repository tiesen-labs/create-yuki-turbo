import { drizzle } from 'drizzle-orm/neon-serverless'

import { env } from '@yuki/env'

import * as auth from './schema/auth'
import * as post from './schema/post'

export const schema = {
  ...auth,
  ...post,
}

export const db = drizzle(env.DATABASE_URL, { schema })

export * from 'drizzle-orm/sql'
