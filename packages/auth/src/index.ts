import { authOptions } from './configs'
import { Auth } from './utils/auth'

const { auth, signIn, signOut, handlers } = Auth(authOptions)

export type { SessionResult } from './utils/session'
export { auth, signIn, signOut, handlers }
export { Session } from './utils/session'
export { Password } from './utils/password'
