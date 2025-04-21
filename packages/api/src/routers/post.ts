import type { TRPCRouterRecord } from '@trpc/server'

import { desc, eq, Post } from '@yuki/db'
import { byIdSchema, createPostSchema } from '@yuki/validators/post'

import { protectedProcedure, publicProcedure } from '../trpc'

export const postRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.Post.findMany({
      orderBy: desc(Post.createdAt),
      with: { author: true },
    })
  }),

  byId: publicProcedure.input(byIdSchema).query(({ ctx, input }) => {
    return ctx.db.query.Post.findFirst({
      where: eq(Post.id, input.id),
    })
  }),

  create: protectedProcedure
    .input(createPostSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(Post)
        .values({
          ...input,
          authorId: ctx.session.user.id,
        })
        .returning()
    }),

  delete: protectedProcedure.input(byIdSchema).mutation(({ ctx, input }) => {
    return ctx.db.delete(Post).where(eq(Post.id, input.id))
  }),
} satisfies TRPCRouterRecord
