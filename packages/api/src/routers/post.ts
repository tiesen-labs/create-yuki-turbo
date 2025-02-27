import type { TRPCRouterRecord } from '@trpc/server'

import { protectedProcedure, publicProcedure } from '../trpc'
import * as schemas from '../validators/post'

export const postRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findMany({ orderBy: { createdAt: 'desc' } })
  }),

  byId: publicProcedure.input(schemas.getByIdSchema).query(({ ctx, input }) => {
    return ctx.db.post.findUnique({ where: { id: input.id } })
  }),

  create: protectedProcedure
    .input(schemas.createSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.post.create({
        data: { ...input, authorId: ctx.session.user.id },
      })
    }),

  delete: protectedProcedure
    .input(schemas.getByIdSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.post.delete({ where: { id: input.id } })
    }),
} satisfies TRPCRouterRecord
