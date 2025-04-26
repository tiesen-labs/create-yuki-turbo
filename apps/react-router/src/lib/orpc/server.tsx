import type {
  FetchInfiniteQueryOptions,
  FetchQueryOptions,
} from '@tanstack/react-query'
import { cache } from 'react'
import { createRouterUtils } from '@orpc/react-query'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { createCaller, createORPCContext } from '@yuki/api'

import { createQueryClient } from '@/lib/orpc/query-client'

/**
 * This wraps the `createORPCContext` helper and provides the required context for the oRPC API when
 * handling a oRPC call from a React Server Component.
 */
const createContext = cache(async (headers: Headers) => {
  const heads = new Headers(headers)
  heads.set('x-orpc-source', 'rsc')

  return createORPCContext({ headers: heads })
})

const getQueryClient = cache(createQueryClient)

const api = (headers: Headers) => createCaller(() => createContext(headers))
const orpc = (headers: Headers) => createRouterUtils(api(headers))

function HydrateClient({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = getQueryClient()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  )
}

function prefetch(
  queryOptions: FetchQueryOptions | FetchInfiniteQueryOptions,
): void {
  const queryClient = getQueryClient()

  if ('getNextPageParam' in queryOptions)
    void queryClient.prefetchInfiniteQuery(queryOptions)
  else void queryClient.prefetchQuery(queryOptions as FetchQueryOptions)
}

function batchPrefetch(
  queryOptionsArray: (FetchQueryOptions | FetchInfiniteQueryOptions)[],
) {
  const queryClient = getQueryClient()

  void Promise.all(
    queryOptionsArray.map((queryOptions) => {
      if ('getNextPageParam' in queryOptions)
        return queryClient.prefetchInfiniteQuery(queryOptions)
      else return queryClient.prefetchQuery(queryOptions as FetchQueryOptions)
    }),
  )
}

export { orpc, prefetch, batchPrefetch, HydrateClient }
