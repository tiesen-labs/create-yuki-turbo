import { PrismaNeon } from '@prisma/adapter-neon'

import { env } from '@yuki/env'

import { PrismaClient } from './generated/client'

const createPrismaClient = () => {
  const adapter = new PrismaNeon({ connectionString: env.DATABASE_URL })
  return new PrismaClient({ adapter })
}
const globalForPrisma = globalThis as unknown as {
  db: ReturnType<typeof createPrismaClient> | undefined
}
export const db = globalForPrisma.db ?? createPrismaClient()
if (env.NODE_ENV !== 'production') globalForPrisma.db = db

export * from './generated/client'
