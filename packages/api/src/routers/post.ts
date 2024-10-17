import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '../trpc'

export const postRouter = createTRPCRouter({
  // [GET] /api/trpc/post.getLatest
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: 'desc' },
      where: { user: { id: ctx.session.user.id } },
    })

    return post ?? null
  }),

  // [POST] /api/trpc/post.create
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          name: input.name,
          user: { connect: { id: ctx.session.user.id } },
        },
      })
    }),
})
