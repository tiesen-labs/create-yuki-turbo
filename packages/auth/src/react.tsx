'use client'

import * as React from 'react'

import type { SessionResult } from './core/session'

interface SessionContextValue {
  session: SessionResult
  status: 'loading' | 'authenticated' | 'unauthenticated'
  refresh: () => Promise<void>
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
  props: Readonly<{
    children: React.ReactNode
    session?: SessionResult
  }>,
) {
  const hasInitialSession = props.session !== undefined

  const [isLoading, setIsLoading] = React.useState(!hasInitialSession)
  const [session, setSession] = React.useState<SessionResult>(() => {
    if (hasInitialSession) return props.session
    return { expires: new Date() }
  })

  React.useEffect(() => {
    if (hasInitialSession) return
    fetchSession()
      .then((session) => {
        setSession(session)
      })
      .catch((error: unknown) => {
        console.error('Error fetching session:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [hasInitialSession])

  const refresh = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const session = await fetchSession()
      setSession(session)
    } catch (error) {
      console.error('Error refreshing session:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = React.useMemo(() => {
    return {
      session,
      status: isLoading
        ? ('loading' as const)
        : session.user
          ? ('authenticated' as const)
          : ('unauthenticated' as const),
      refresh,
    }
  }, [session, isLoading, refresh])

  return <SessionContext value={value}>{props.children}</SessionContext>
}

export async function fetchSession(): Promise<SessionResult> {
  try {
    const res = await fetch('/api/auth')
    if (!res.ok) throw new Error('Failed to fetch session')
    return (await res.json()) as SessionResult
  } catch (error) {
    console.error('Error fetching session:', error)
    return { expires: new Date() }
  }
}
