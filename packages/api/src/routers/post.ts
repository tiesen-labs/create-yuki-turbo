import type { TRPCRouterRecord } from '@trpc/server'

import { desc, eq } from '@yuki/db'
import { posts } from '@yuki/db/schema'
import { byIdSchema, createPostSchema } from '@yuki/validators/post'

import { protectedProcedure, publicProcedure } from '../trpc'

export const postRouter = {
  all: publicProcedure.query(({ ctx }) =>
    ctx.db.query.posts.findMany({
      orderBy: desc(posts.createdAt),
      with: { author: { columns: { id: true, name: true, image: true } } },
    }),
  ),

  byId: publicProcedure.input(byIdSchema).query(({ ctx, input }) =>
    ctx.db.query.posts.findFirst({
      where: (posts, { eq }) => eq(posts.id, input.id),
    }),
  ),

  create: protectedProcedure
    .input(createPostSchema)
    .mutation(({ ctx, input }) =>
      ctx.db
        .insert(posts)
        .values({
          ...input,
          authorId: ctx.session.user.id,
        })
        .returning(),
    ),

  delete: protectedProcedure
    .input(byIdSchema)
    .mutation(({ ctx, input }) =>
      ctx.db.delete(posts).where(eq(posts.id, input.id)).returning(),
    ),
} satisfies TRPCRouterRecord
