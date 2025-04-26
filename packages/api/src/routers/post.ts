import type { TRPCRouterRecord } from '@trpc/server'

import { byIdSchema, createPostSchema } from '@yuki/validators/post'

import { protectedProcedure, publicProcedure } from '../trpc'

export const postRouter = {
  all: publicProcedure.query(({ ctx }) =>
    ctx.db.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true, image: true } } },
    }),
  ),

  byId: publicProcedure
    .input(byIdSchema)
    .query(({ ctx, input }) =>
      ctx.db.post.findUnique({ where: { id: input.id } }),
    ),

  create: protectedProcedure
    .input(createPostSchema)
    .mutation(({ ctx, input }) =>
      ctx.db.post.create({ data: { ...input, authorId: ctx.session.user.id } }),
    ),

  delete: protectedProcedure
    .input(byIdSchema)
    .mutation(({ ctx, input }) =>
      ctx.db.post.delete({ where: { id: input.id } }),
    ),
} satisfies TRPCRouterRecord
