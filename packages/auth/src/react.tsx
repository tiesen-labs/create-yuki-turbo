'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'

import type { SessionResult } from './utils/session'

interface SessionContextValue {
  session: SessionResult
  isLoading: boolean
}

const SessionContext = React.createContext<SessionContextValue | undefined>(
  undefined,
)

export const useSession = () => {
  const ctx = React.useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within a SessionProvider')
  return ctx
}

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session = { expires: new Date() }, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const res = await fetch('/api/auth')
      return res.json() as Promise<SessionResult>
    },
  })

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  )
}
