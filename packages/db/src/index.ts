import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'

import * as schema from './schema'

const createDrizzleClient = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return drizzle({ client: pool, schema, casing: 'snake_case' })
}
const globalForDrizzle = globalThis as unknown as {
  db: ReturnType<typeof createDrizzleClient> | undefined
}
export const db = globalForDrizzle.db ?? createDrizzleClient()
if (process.env.NODE_ENV !== 'production') globalForDrizzle.db = db

export * from 'drizzle-orm/sql'
