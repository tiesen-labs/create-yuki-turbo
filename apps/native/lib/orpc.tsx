import type { RouterUtils } from '@orpc/react-query'
import * as React from 'react'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createORPCReactQueryUtils } from '@orpc/react-query'
import {
  defaultShouldDehydrateQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import type { AppRouter } from '@yuki/api'

import { getToken } from '@/lib/session'
import { getBaseUrl } from '@/lib/utils'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: 60 * 1000,
    },
    dehydrate: {
      shouldDehydrateQuery: (query) =>
        defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
    },
    hydrate: {},
  },
})

interface ORPCReactUtils {
  orpc: RouterUtils<AppRouter>
  orpcClient: AppRouter
  queryClient: QueryClient
}

const ORPCContext = React.createContext<ORPCReactUtils | undefined>(undefined)

const useORPC = () => {
  const context = React.use(ORPCContext)
  if (!context) throw new Error('useORPC must be used within a ORPCProvider')
  return context
}

const ORPCReactProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orpcClient] = React.useState<AppRouter>(() => {
    const link = new RPCLink({
      url: getBaseUrl() + '/api/orpc',
      headers: {
        'x-orpc-source': 'react-native',
        authorization: `Bearer ${getToken()}`,
      },
    })
    return createORPCClient(link)
  })

  const [orpc] = React.useState<RouterUtils<AppRouter>>(() =>
    createORPCReactQueryUtils(orpcClient),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ORPCContext value={{ orpc, orpcClient, queryClient }}>
        {children}
      </ORPCContext>
    </QueryClientProvider>
  )
}

export { useORPC, ORPCReactProvider }
