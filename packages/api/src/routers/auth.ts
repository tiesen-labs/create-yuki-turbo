import type { TRPCRouterRecord } from '@trpc/server'
import { TRPCError } from '@trpc/server'

import { Password, Session } from '@yuki/auth'
import { signInSchema, signUpSchema } from '@yuki/validators/auth'

import { publicProcedure } from '../trpc'

export const authRouter = {
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session
  }),

  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ ctx, input: { email, password } }) => {
      const user = await ctx.db.user.findUnique({ where: { email } })
      if (!user) throw new Error('User not found')
      if (!user.password)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User has no password',
        })

      const passwordMatch = new Password().verify(password, user.password)
      if (!passwordMatch)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password',
        })

      return new Session().createSession(user.id)
    }),

  signUp: publicProcedure
    .input(signUpSchema)
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
