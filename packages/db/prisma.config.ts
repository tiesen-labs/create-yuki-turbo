import path from 'path'
import type { PrismaConfig } from 'prisma'

export default {
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma'),
} satisfies PrismaConfig<{
  DATABASE_URL: string
}>
