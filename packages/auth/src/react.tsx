'use client'

import * as React from 'react'

import type { SessionResult } from './core/session'

interface SessionContextValue {
  session: SessionResult
  isLoading: boolean
  signOut: () => Promise<void>
}

const SessionContext = React.createContext<SessionContextValue | undefined>(
  undefined,
)

export function useSession() {
  const ctx = React.useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within a SessionProvider')
  return ctx
}

export function SessionProvider(
  props: Readonly<{ children: React.ReactNode; session?: SessionResult }>,
) {
  const hasInitialSession = props.session !== undefined
  const [isLoading, setIsLoading] = React.useState(!hasInitialSession)
  const [session, setSession] = React.useState<SessionResult>(() => {
    if (hasInitialSession) return props.session
    return { expires: new Date() }
  })

  async function fetchSession(): Promise<void> {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth')
      if (!res.ok) throw new Error('Failed to fetch session')
      setSession((await res.json()) as SessionResult)
    } catch (error) {
      console.error('Error fetching session:', error)
      setSession({ expires: new Date() })
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (hasInitialSession) return
    void fetchSession()
  }, [hasInitialSession])

  const signOut = React.useCallback(async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' })
    setSession({ expires: new Date() })
  }, [])

  const value = React.useMemo(
    () => ({
      session,
      isLoading,
      signOut,
    }),
    [session, isLoading, signOut],
  )

  return <SessionContext value={value}>{props.children}</SessionContext>
}
