import type { TRPCQueryOptions } from '@trpc/tanstack-react-query'
import { cache } from 'react'
import { headers } from 'next/headers'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

import { appRouter, createTRPCContext } from '@yuki/api'

import { createQueryClient } from '@/lib/trpc/query-client'

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers())
  heads.set('x-trpc-source', 'rsc')

  return createTRPCContext({ headers: heads })
})

const getQueryClient = cache(createQueryClient)

const trpc = createTRPCOptionsProxy({
  ctx: createContext,
  queryClient: getQueryClient,
  router: appRouter,
})

function HydrateClient({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = getQueryClient()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  )
}

function prefetch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryOptions: ReturnType<TRPCQueryOptions<any>>,
): void {
  const queryClient = getQueryClient()

  if (queryOptions.queryKey[1]?.type === 'infinite')
    void queryClient.prefetchInfiniteQuery(queryOptions as never)
  else void queryClient.prefetchQuery(queryOptions)
}

export { trpc, prefetch, HydrateClient }
