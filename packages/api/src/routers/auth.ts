import type { TRPCRouterRecord } from '@trpc/server'
import { TRPCError } from '@trpc/server'

import { Password, Session } from '@yuki/auth'
import { eq } from '@yuki/db'
import { users } from '@yuki/db/schema'
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
      const user = await ctx.db.query.users.findFirst({
        where: (user, { eq }) => eq(user.email, email),
      })
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
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
      })
      if (user)
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        })

      return ctx.db.insert(users).values({
        name: input.name,
        email: input.email,
        image: '',
        password: pass.hash(input.password),
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

      return ctx.db
        .update(users)
        .set({ password: pass.hash(input.newPassword) })
        .where(eq(users.id, ctx.session.user.id))
    }),
} satisfies TRPCRouterRecord
