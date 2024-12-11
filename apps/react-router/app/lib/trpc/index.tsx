import type { QueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import SuperJSON from 'superjson'

import type { AppRouter } from '@yuki/api'

import { useCookies } from '@/lib/hooks/use-cookies'
import { createQueryClient } from '@/lib/trpc/query-client'

let clientQueryClientSingleton: QueryClient | undefined = undefined
const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient()
  } else {
    // Browser: use singleton pattern to keep the same query client
    return (clientQueryClientSingleton ??= createQueryClient())
  }
}

export const api = createTRPCReact<AppRouter>()

export const TRPCReactProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const queryClient = getQueryClient()
  const cookies = useCookies<{ auth_session: string }>()

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            // eslint-disable-next-line turbo/no-undeclared-env-vars
            import.meta.env.DEV || (op.direction === 'down' && op.result instanceof Error),
        }),
        httpBatchLink({
          transformer: SuperJSON,
          url: getBaseUrl() + '/api/trpc',
          headers() {
            const headers = new Headers()
            headers.set('x-trpc-source', 'react-router')
            headers.set('Authorization', `Bearer ${cookies?.auth_session}`)
            return headers
          },
        }),
      ],
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  )
}

const getBaseUrl = () => {
  // if () return `https://your.next.app.url`
  return `http://localhost:3000`
}
