import type { TRPCRouterRecord } from '@trpc/server'

import { desc, eq, schema } from '@yuki/db'
import { byIdSchema, createPostSchema } from '@yuki/validators/post'

import { protectedProcedure, publicProcedure } from '../trpc'

export const postRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.Post.findMany({
      orderBy: desc(schema.Post.createdAt),
      with: { author: true },
    })
  }),

  byId: publicProcedure.input(byIdSchema).query(({ ctx, input }) => {
    return ctx.db.query.Post.findFirst({
      where: eq(schema.Post.id, input.id),
    })
  }),

  create: protectedProcedure
    .input(createPostSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(schema.Post)
        .values({
          ...input,
          authorId: ctx.session.user.id,
        })
        .returning()
    }),

  delete: protectedProcedure.input(byIdSchema).mutation(({ ctx, input }) => {
    return ctx.db.delete(schema.Post).where(eq(schema.Post.id, input.id))
  }),
} satisfies TRPCRouterRecord
