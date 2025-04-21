import { relations } from 'drizzle-orm'
import { pgTable, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core'

import { Post } from './post'

export const User = pgTable(
  'User',
  (t) => ({
    id: t.uuid().notNull().defaultRandom(),
    name: t.varchar({ length: 255 }).notNull(),
    email: t.varchar({ length: 255 }).notNull(),
    password: t.varchar({ length: 255 }),
    image: t.varchar({ length: 255 }).notNull(),
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: 'date', withTimezone: true })
      .$onUpdateFn(() => new Date()),
  }),
  (table) => [
    primaryKey({ name: 'User_pkey', columns: [table.id] }),
    uniqueIndex('User_email_unique').on(table.email),
  ],
)

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
    primaryKey({
      name: 'Account_pkey',
      columns: [account.provider, account.providerAccountId],
    }),
  ],
)

export const accountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}))

export const Session = pgTable(
  'Session',
  (t) => ({
    sessionToken: t.varchar({ length: 255 }).notNull(),
    expires: t.timestamp({ mode: 'date', withTimezone: true }).notNull(),
    userId: t
      .uuid()
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
  }),
  (table) => [
    primaryKey({ name: 'Session_pkey', columns: [table.sessionToken] }),
  ],
)

export const sessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}))
