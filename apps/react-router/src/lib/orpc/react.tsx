import type { RouterUtils } from '@orpc/react-query'
import type { QueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import {
  BatchLinkPlugin,
  SimpleCsrfProtectionLinkPlugin,
} from '@orpc/client/plugins'
import { createORPCReactQueryUtils } from '@orpc/react-query'
import { QueryClientProvider } from '@tanstack/react-query'

import type { AppRouter } from '@yuki/api'

import { createQueryClient } from '@/lib/orpc/query-client'
import { getBaseUrl } from '@/lib/utils'

let clientQueryClientSingleton: QueryClient | undefined = undefined
const getQueryClient = () => {
  if (typeof window === 'undefined') return createQueryClient()
  else return (clientQueryClientSingleton ??= createQueryClient())
}

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
  const queryClient = getQueryClient()

  const [orpcClient] = React.useState<AppRouter>(() => {
    const link = new RPCLink({
      url: getBaseUrl() + '/api/orpc',
      headers: { 'x-orpc-source': 'react-router' },
      plugins: [
        new SimpleCsrfProtectionLinkPlugin(),
        new BatchLinkPlugin({
          groups: [{ condition: () => true, context: {} }],
        }),
      ],
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

export { ORPCReactProvider, useORPC }
