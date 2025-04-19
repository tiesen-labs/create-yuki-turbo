'use client'

import * as React from 'react'
import * as Linking from 'expo-linking'
import * as Browser from 'expo-web-browser'

import type { SessionResult } from '@yuki/auth'

import { deleteToken, getToken, setToken } from '@/lib/session'
import { getBaseUrl } from '@/lib/utils'

interface SessionContextValue {
  session: SessionResult
  isLoading: boolean
  signIn: () => Promise<void>
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

  async function fetchSession(): Promise<void> {
    setIsLoading(true)
    try {
      const res = await fetch(`${getBaseUrl()}/api/auth`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      })

      if (!res.ok) throw new Error('Failed to fetch session')
      const data = (await res.json()) as SessionResult
      setSession(data)
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

  const signIn = React.useCallback(async () => {
    const redirectTo = Linking.createURL('/')
    const result = await Browser.openAuthSessionAsync(
      `${getBaseUrl()}/login?redirect_uri=${encodeURIComponent(redirectTo)}`,
      redirectTo,
    )

    if (result.type !== 'success') throw new Error('Failed to sign in')
    const url = Linking.parse(result.url)
    const sessionToken = String(url.queryParams?.token)
    if (!sessionToken) throw new Error('No session token found')
    setToken(sessionToken)
    await fetchSession()
  }, [])

  const signOut = React.useCallback(async () => {
    await fetch(`${getBaseUrl()}/api/auth/sign-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
    await deleteToken()
    setSession({ expires: new Date() })
  }, [])

  const value = React.useMemo(
    () => ({
      session,
      isLoading,
      signIn,
      signOut,
    }),
    [session, isLoading, signIn, signOut],
  )

  return <SessionContext value={value}>{props.children}</SessionContext>
}
