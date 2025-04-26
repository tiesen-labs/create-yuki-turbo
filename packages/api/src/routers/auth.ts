import type { TRPCRouterRecord } from '@trpc/server'
import { TRPCError } from '@trpc/server'

import { Password, Session } from '@yuki/auth'
import {
  changePasswordSchema,
  signInSchema,
  signUpSchema,
} from '@yuki/validators/auth'

import { protectedProcedure, publicProcedure } from '../trpc'

const password = new Password()
const session = new Session()

export const authRouter = {
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      })

      if (!user)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      if (!user.password)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User has no password',
        })

      if (!password.verify(input.password, user.password))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password',
        })

      return session.create(user.id)
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

      return await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          image: '',
          password: password.hash(input.password),
        },
      })
    }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      if (
        ctx.session.user.password &&
        !password.verify(input.currentPassword ?? '', ctx.session.user.password)
      )
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password',
        })

      return await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { password: password.hash(input.newPassword) },
      })
    }),
} satisfies TRPCRouterRecord
