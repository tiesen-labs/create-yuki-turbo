import type { TRPCRouterRecord } from '@trpc/server'

import { protectedProcedure } from '../trpc'

export const userRouter = {
  getLinkedAccounts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.account.findMany({
      where: { userId: ctx.session.user.id },
    })
  }),
} satisfies TRPCRouterRecord
