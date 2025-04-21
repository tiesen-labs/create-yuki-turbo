import { drizzle } from 'drizzle-orm/neon-serverless'

import { env } from '@yuki/env'

import * as auth from './schema/auth'
import * as post from './schema/post'

export const schema = {
  ...auth,
  ...post,
}

const createDrizzleClient = () => drizzle(env.DATABASE_URL, { schema })
const globalForDrizzle = globalThis as unknown as {
  db: ReturnType<typeof createDrizzleClient> | undefined
}
export const db = globalForDrizzle.db ?? createDrizzleClient()
if (env.NODE_ENV !== 'production') globalForDrizzle.db = db

export * from 'drizzle-orm/sql'
