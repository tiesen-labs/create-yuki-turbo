'use client'

import { createContext, use } from 'react'

import type { SessionValidation } from '@yuki/auth'

const sessionContext = createContext<SessionValidation | undefined>(undefined)

export const SessionProvider: React.FC<
  Readonly<{
    session: SessionValidation
    children: React.ReactNode
  }>
> = ({ session, children }) => (
  <sessionContext.Provider value={session}>{children}</sessionContext.Provider>
)

export const useSession = () => {
  const context = use(sessionContext)
  if (!context) throw new Error('useSession must be used within a SessionProvider')
  return context
}
