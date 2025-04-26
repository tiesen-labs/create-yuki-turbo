import { ORPCError } from '@orpc/server'

import { Password, Session } from '@yuki/auth'
import { eq } from '@yuki/db'
import { users } from '@yuki/db/schema'
import {
  changePasswordSchema,
  signInSchema,
  signUpSchema,
} from '@yuki/validators/auth'

import { protectedProcedure, publicProcedure } from '../orpc'

const password = new Password()
const session = new Session()

export const authRouter = {
  signIn: publicProcedure
    .route({ method: 'POST' })
    .input(signInSchema)
    .handler(async ({ context, input }) => {
      const user = await context.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
      })

      if (!user) throw new ORPCError('NOT_FOUND', { message: 'User not found' })
      if (!user.password)
        throw new ORPCError('UNAUTHORIZED', {
          message: 'User has no password',
        })

      if (!password.verify(input.password, user.password))
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Invalid password',
        })

      return session.create(user.id)
    }),

  signUp: publicProcedure
    .route({ method: 'POST' })
    .input(signUpSchema)
    .handler(async ({ context, input }) => {
      const user = await context.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
      })

      if (user)
        throw new ORPCError('CONFLICT', {
          message: 'User already exists',
        })

      return await context.db
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
    .route({ method: 'POST' })
    .input(changePasswordSchema)
    .handler(async ({ context, input }) => {
      if (
        context.session.user.password &&
        !password.verify(
          input.currentPassword ?? '',
          context.session.user.password,
        )
      )
        throw new ORPCError('UNAUTHORIZED', {
          message: 'Invalid password',
        })

      return await context.db
        .update(users)
        .set({ password: password.hash(input.newPassword) })
        .where(eq(users.id, context.session.user.id))
        .returning()
    }),
}
