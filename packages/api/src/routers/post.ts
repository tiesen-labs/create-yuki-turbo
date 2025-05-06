import { EventEmitter, on } from 'events'
import type { TRPCRouterRecord } from '@trpc/server'

import { desc, eq } from '@yuki/db'
import { posts } from '@yuki/db/schema'
import { byIdSchema, createPostSchema } from '@yuki/validators/post'

import { protectedProcedure, publicProcedure } from '../trpc'

const ee = new EventEmitter()

export const postRouter = {
  all: publicProcedure.query(({ ctx }) =>
    ctx.db.query.posts.findMany({
      orderBy: desc(posts.createdAt),
    }),
  ),

  byId: publicProcedure.input(byIdSchema).query(({ ctx, input }) =>
    ctx.db.query.posts.findFirst({
      where: (posts, { eq }) => eq(posts.id, input.id),
    }),
  ),

  create: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      const [post] = await ctx.db
        .insert(posts)
        .values({
          ...input,
          authorId: ctx.session.user.id,
        })
        .returning()

      ee.emit('postCreated', post)

      return post
    }),

  onCreate: publicProcedure.subscription(async function* ({ signal }) {
    for await (const [data] of on(ee, 'postCreated', { signal })) {
      yield data as typeof posts.$inferSelect
    }
  }),

  delete: protectedProcedure
    .input(byIdSchema)
    .mutation(({ ctx, input }) =>
      ctx.db.delete(posts).where(eq(posts.id, input.id)).returning(),
    ),
} satisfies TRPCRouterRecord
