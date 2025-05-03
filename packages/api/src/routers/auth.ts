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

const password = new Password()
const session = new Session()

export const authRouter = {
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
      })

      if (!user)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      if (!user.password)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Incorrect username or password',
        })

      if (!password.verify(input.password, user.password))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Incorrect username or password',
        })

      return session.create(user.id)
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

      return await ctx.db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          image: '',
          password: password.hash(input.password),
        })
        .returning()
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

      return await ctx.db
        .update(users)
        .set({ password: password.hash(input.newPassword) })
        .where(eq(users.id, ctx.session.user.id))
        .returning()
    }),
} satisfies TRPCRouterRecord
