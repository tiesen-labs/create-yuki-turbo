import { desc, eq } from '@yuki/db'
import { posts } from '@yuki/db/schema'
import { byIdSchema, createPostSchema } from '@yuki/validators/post'

import { protectedProcedure, publicProcedure } from '../orpc'

export const postRouter = {
  all: publicProcedure.route({ method: 'GET' }).handler(({ context }) =>
    context.db.query.posts.findMany({
      orderBy: desc(posts.createdAt),
      with: { author: { columns: { id: true, name: true, image: true } } },
    }),
  ),

  byId: publicProcedure.input(byIdSchema).handler(({ context, input }) =>
    context.db.query.posts.findFirst({
      where: (posts, { eq }) => eq(posts.id, input.id),
    }),
  ),

  create: protectedProcedure
    .route({ method: 'POST' })
    .input(createPostSchema)
    .handler(({ context, input }) =>
      context.db
        .insert(posts)
        .values({
          ...input,
          authorId: context.session.user.id,
        })
        .returning(),
    ),

  delete: protectedProcedure
    .route({ method: 'DELETE' })
    .input(byIdSchema)
    .handler(({ context, input }) =>
      context.db.delete(posts).where(eq(posts.id, input.id)).returning(),
    ),
}
