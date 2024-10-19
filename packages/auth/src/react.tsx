'use client'

import type { Session, User } from '@prisma/client'
import { createContext, useContext } from 'react'

type SessionContext = null | (Session & { user: User })
const sessionContext = createContext<SessionContext | undefined>(undefined)

export const SessionProvider: React.FC<{ session: SessionContext; children: React.ReactNode }> = ({
  session,
  children,
}) => <sessionContext.Provider value={session}>{children}</sessionContext.Provider>

export const useSession = () => {
  const context = useContext(sessionContext)
  if (context === undefined) throw new Error('useSession must be used within a SessionProvider')

  return context
}
