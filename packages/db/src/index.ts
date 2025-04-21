import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import * as auth from './schema/auth'
import * as post from './schema/post'

export const schema = {
  ...auth,
  ...post,
}

const sql = neon(process.env.DATABASE_URL ?? '')

export const db = drizzle({
  client: sql,
  schema,
  casing: 'camelCase',
})

export * from 'drizzle-orm/sql'
