'use client'

import * as React from 'react'

import type { Options } from './config'
import type { SessionResult } from './types'

type Provider = 'credentials' | keyof Options

type SessionContextValue<TProvider extends Provider = Provider> = {
  signIn: (
    providers: TProvider,
    options: TProvider extends 'credentials'
      ? { email: string; password: string }
      : { redirectTo?: string },
  ) => Promise<void>
  signOut: () => Promise<void>
  refresh: (token?: string) => Promise<void>
} & (
  | { status: 'loading'; session: SessionResult }
  | {
      status: 'authenticated'
      session: { user: NonNullable<SessionResult['user']>; expires: Date }
    }
  | { status: 'unauthenticated'; session: { expires: Date } }
)

const SessionContext = React.createContext<SessionContextValue | undefined>(
  undefined,
)

export function useSession() {
  const ctx = React.use(SessionContext)
  if (!ctx) throw new Error('useSession must be used within a SessionProvider')
  return ctx
}

interface SessionProviderProps {
  children: React.ReactNode
  session?: SessionResult
}

export function SessionProvider({
  children,
  session: initialSession,
}: Readonly<SessionProviderProps>) {
  const hasInitialSession = initialSession !== undefined
  const [isLoading, setIsLoading] = React.useState(!hasInitialSession)
  const [session, setSession] = React.useState<SessionResult>(() => {
    if (hasInitialSession) return initialSession
    return { expires: new Date() }
  })

  const status = React.useMemo(() => {
    if (isLoading) return 'loading' as const
    return session.user
      ? ('authenticated' as const)
      : ('unauthenticated' as const)
  }, [session, isLoading])

  const fetchSession = React.useCallback(
    async (token?: string): Promise<void> => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/auth', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) throw new Error(`Failed to fetch session: ${res.status}`)

        const sessionData = (await res.json()) as SessionResult
        setSession(sessionData)
      } catch (error) {
        console.error('Error fetching session:', error)
        setSession({ expires: new Date() })
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const signIn = React.useCallback(
    async <TProvider extends Provider>(
      provider: TProvider,
      options: TProvider extends 'credentials'
        ? { email: string; password: string }
        : { redirectTo?: string },
    ) => {
      if (provider === 'credentials') {
        const res = await fetch('/api/auth/sign-in', {
          method: 'POST',
          body: JSON.stringify(options),
        })
        const json = (await res.json()) as { token: string; error: string }
        if (!res.ok) throw new Error(json.error)
        await fetchSession(json.token)
        return json.token
      } else {
        const redirectTo =
          (options as { redirectTo?: string }).redirectTo ?? '/'
        window.location.href = `/api/auth/sign-in/${provider}?redirect_to=${redirectTo}`
      }
    },
    [fetchSession],
  )

  const signOut = React.useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/auth/sign-out', { method: 'POST' })
      if (!res.ok) throw new Error(`Sign out failed: ${res.status}`)
      setSession({ expires: new Date() })
      window.location.reload()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [])

  React.useEffect(() => {
    if (hasInitialSession) return
    void fetchSession()
  }, [fetchSession, hasInitialSession])

  const value = React.useMemo(
    () =>
      ({
        session,
        status,
        signIn,
        signOut,
        refresh: fetchSession,
      }) as SessionContextValue,
    [session, status, signIn, signOut, fetchSession],
  )

  return <SessionContext value={value}>{children}</SessionContext>
}
