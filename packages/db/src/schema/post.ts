import { relations } from 'drizzle-orm'
import { pgTable, primaryKey } from 'drizzle-orm/pg-core'

import { User } from './auth'

export const Post = pgTable(
  'Post',
  (t) => ({
    id: t.uuid().notNull().defaultRandom(),
    title: t.varchar({ length: 255 }).notNull(),
    content: t.text().notNull(),
    authorId: t
      .uuid()
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    createdAt: t.timestamp().defaultNow().notNull(),
  }),
  (table) => [primaryKey({ name: 'Post_pkey', columns: [table.id] })],
)

export const postRelations = relations(Post, ({ one }) => ({
  author: one(User, { fields: [Post.authorId], references: [User.id] }),
}))
