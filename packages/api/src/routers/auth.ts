import type { TRPCRouterRecord } from '@trpc/server'
import { TRPCError } from '@trpc/server'

import { Password } from '@yuki/auth'

import { publicProcedure } from '../trpc'
import * as schemas from '../validators/auth'

export const authRouter = {
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session
  }),

  signUp: publicProcedure
    .input(schemas.signUpSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      })
      if (user)
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        })

      return ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          image: '',
          password: new Password().hash(input.password),
        },
      })
    }),
} satisfies TRPCRouterRecord
