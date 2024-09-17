'use client'

import type { Session, User } from '@prisma/client'
import * as React from 'react'

type SessionContext = null | (Session & { user: User })

const sessionContext = React.createContext<SessionContext>(null)

interface SessionProviderProps {
  session: SessionContext
  children: Readonly<React.ReactNode>
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ session, children }) => (
  <sessionContext.Provider value={session}>{children}</sessionContext.Provider>
)

export const useSession = () => {
  const context = React.useContext(sessionContext)
  return context
}
