import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { appRouter, createTRPCContext } from '@yuki/api'

import type { Route } from './+types/api.trpc.$'
import { getAuthToken } from '@/lib/utils'

const handler = async (args: Route.LoaderArgs | Route.ActionArgs) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req: args.request,
    router: appRouter,
    createContext: async () => {
      const heads = new Headers()
      heads.append('Authorization', `Bearer_${getAuthToken(args.request.headers.get('Cookie'))}`)
      return createTRPCContext({ headers: heads })
    },
  })

export const loader = (agrs: Route.LoaderArgs) => handler(agrs)
export const action = (agrs: Route.ActionArgs) => handler(agrs)
