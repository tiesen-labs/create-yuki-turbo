import { relations, sql } from 'drizzle-orm'
import { pgTable, primaryKey } from 'drizzle-orm/pg-core'

import { Post } from './post'

export const User = pgTable('User', (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 255 }).notNull(),
  email: t.varchar({ length: 255 }).notNull().unique(),
  password: t.varchar({ length: 255 }),
  image: t.varchar({ length: 255 }).notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: 'date', withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}))

export const userRelations = relations(User, ({ many }) => ({
  accounts: many(Account),
  sessions: many(Session),
  posts: many(Post),
}))

export const Account = pgTable(
  'Account',
  (t) => ({
    provider: t.varchar({ length: 255 }).notNull(),
    providerAccountId: t.varchar({ length: 255 }).notNull(),
    userId: t
      .uuid()
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
  }),
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
)

export const accountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}))

export const Session = pgTable('Session', (t) => ({
  sessionToken: t.varchar({ length: 255 }).notNull(),
  expires: t.timestamp({ mode: 'date', withTimezone: true }).notNull(),
  userId: t
    .uuid()
    .notNull()
    .references(() => User.id, { onDelete: 'cascade' }),
}))

export const sessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}))
