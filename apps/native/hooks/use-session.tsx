import * as React from 'react'
import { useQuery } from '@tanstack/react-query'

import type { SessionResult } from '@yuki/auth'

import { getToken } from '@/lib/session'
import { getBaseUrl } from '@/lib/utils'

const SessionContext = React.createContext<{
  session: SessionResult
  refresh: () => Promise<void>
  isLoading: boolean
} | null>(null)

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const {
    data: session = { expires: new Date() },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch(`${getBaseUrl()}/api/auth`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      })
      return (await res.json()) as SessionResult
    },
  })

  const value = React.useMemo(
    () => ({
      session,
      isLoading,
      refresh: async () => {
        await refetch()
      },
    }),
    [session, isLoading, refetch],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = React.useContext(SessionContext)
  if (!context)
    throw new Error('useSession must be used within a SessionProvider')
  return context
}
