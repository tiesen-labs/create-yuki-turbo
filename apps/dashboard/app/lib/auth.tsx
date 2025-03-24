import * as React from 'react'
import { useQuery } from '@tanstack/react-query'

import type { SessionResult } from '@yuki/auth'

interface SessionContextValue {
  session: SessionResult
  isLoading: boolean
}

const SessionContext = React.createContext<SessionContextValue | null>(null)

export function SessionProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: session, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const resp = await fetch('http://localhost:3000/api/auth', {
        credentials: 'include',
      })
      if (!resp.ok) throw new Error('Failed to fetch session')
      return resp.json() as Promise<SessionContextValue['session']>
    },
  })

  return (
    <SessionContext.Provider
      value={{
        session: session ?? { expires: new Date() },
        isLoading,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = React.use(SessionContext)
  if (!ctx)
    throw new Error('useSession() must be used within a `SessionProvider`')
  return ctx
}
