import type { TRPCRouterRecord } from '@trpc/server'

import { protectedProcedure, publicProcedure } from '../trpc'
import { postSchema } from '../validators/post'

export const postRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findMany()
  }),

  byId: publicProcedure.input(postSchema.byId).query(({ ctx, input }) => {
    return ctx.db.post.findUnique({ where: { id: input.id } })
  }),

  create: protectedProcedure.input(postSchema.create).mutation(({ ctx, input }) => {
    return ctx.db.post.create({
      data: { title: input.title, user: { connect: { id: ctx.session.userId } } },
    })
  }),

  delete: protectedProcedure.input(postSchema.byId).mutation(({ ctx, input }) => {
    return ctx.db.post.delete({ where: { id: input.id } })
  }),
} satisfies TRPCRouterRecord
