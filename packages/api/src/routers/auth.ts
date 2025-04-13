import type { TRPCRouterRecord } from '@trpc/server'
import { TRPCError } from '@trpc/server'

import { Password, Session } from '@yuki/auth'
import {
  changePasswordSchema,
  signInSchema,
  signUpSchema,
} from '@yuki/validators/auth'

import { protectedProcedure, publicProcedure } from '../trpc'

const pass = new Password()

export const authRouter = {
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

      const passwordMatch = pass.verify(password, user.password)
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
          password: pass.hash(input.password),
        },
      })
    }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.password) {
        const passwordMatch = pass.verify(
          input.currentPassword ?? '',
          ctx.session.user.password,
        )
        if (!passwordMatch)
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid password',
          })
      }

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { password: pass.hash(input.newPassword) },
      })
    }),
} satisfies TRPCRouterRecord
