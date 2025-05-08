import type { users } from '@yuki/db/schema'

import type { BaseProvider } from './providers/base'

export type Providers = Record<string, BaseProvider>
export type AuthOptions<T extends Providers = Providers> = T

export interface SessionResult {
  user?: typeof users.$inferSelect
  expires: Date
}

export type Handler = (req: Request) => Response | Promise<Response>

export type AuthParams =
  | Request
  | ((params: {
      req: Request
      session: SessionResult
    }) => Response | Promise<Response>)
