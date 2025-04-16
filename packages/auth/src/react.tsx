'use client'

import * as React from 'react'

import type { SessionResult } from './core/session'

interface SessionContextValue {
  session: SessionResult
  isLoading: boolean
  refresh: (token?: string) => Promise<void>
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
    baseUrl?: string
    sessionToken?: string
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
    fetchSession(props.baseUrl, props.sessionToken)
      .then((session) => {
        setSession(session)
      })
      .catch((error: unknown) => {
        console.error('Error fetching session:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [hasInitialSession, props.baseUrl, props.sessionToken])

  const refresh = React.useCallback(
    async (token?: string) => {
      setIsLoading(true)
      try {
        const session = await fetchSession(
          props.baseUrl,
          token ?? props.sessionToken,
        )
        setSession(session)
      } catch (error) {
        console.error('Error refreshing session:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [props.baseUrl, props.sessionToken],
  )

  const value = React.useMemo(() => {
    return {
      session,
      isLoading,
      refresh,
    }
  }, [session, isLoading, refresh])

  return <SessionContext value={value}>{props.children}</SessionContext>
}

export async function fetchSession(
  baseUrl?: string,
  sessionToken?: string,
): Promise<SessionResult> {
  try {
    const res = await fetch(`${baseUrl ?? ''}/api/auth`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
    })

    if (!res.ok) throw new Error('Failed to fetch session')
    return (await res.json()) as SessionResult
  } catch (error) {
    console.error('Error fetching session:', error)
    return { expires: new Date() }
  }
}
