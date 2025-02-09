'use client'

import * as React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'

import type { Session } from '@yuki/auth'

const sessionContext = React.createContext<
  | {
      session?: Session
      isLoading: boolean
      signOut: () => void
    }
  | undefined
>(undefined)

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    data: session,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const res = await fetch('/api/auth')
      return res.json() as Promise<Session>
    },
  })

  const signOut = useMutation({
    mutationKey: ['auth', 'signOut'],
    mutationFn: async () => {
      await fetch('/api/auth/signOut')
    },
    onSuccess: () => refetch(),
  })

  return (
    <sessionContext.Provider value={{ session, isLoading, signOut: signOut.mutate }}>
      {children}
    </sessionContext.Provider>
  )
}

export const useSession = () => {
  const ctx = React.use(sessionContext)
  if (!ctx) throw new Error('useSession must be used within a SessionProvider')
  return ctx
}
