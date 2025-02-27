import { cache } from 'react'

import { authOptions } from './configs'
import { Auth } from './utils/auth'

const { auth: uncachedAuth, signIn, signOut, handlers } = Auth(authOptions)

/**
 * This is the main way to get session data for your RSCs.
 * This will de-duplicate all calls to next-auth's default `auth()` function and only call it once per request
 */
const auth = cache(uncachedAuth)

export type { SessionResult } from './utils/session'
export { auth, signIn, signOut, handlers }
export { Session } from './utils/session'
export { Password } from './utils/password'
