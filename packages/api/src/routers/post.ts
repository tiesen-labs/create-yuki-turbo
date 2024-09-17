import { z } from 'zod'

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const postRouter = createTRPCRouter({
  getPost: publicProcedure.query(({ ctx }) => {
    const post = ctx.db.post.findFirst({ orderBy: { createdAt: 'desc' } })
    return post
  }),

  createPost: protectedProcedure
    .input(z.object({ content: z.string().min(1, 'Content is required') }))
    .mutation(({ ctx, input }) => {
      const post = ctx.db.post.create({
        data: {
          content: input.content,
          author: { connect: { id: ctx.session.user.id } },
        },
      })
      return post
    }),
})
