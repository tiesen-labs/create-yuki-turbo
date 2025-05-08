import { authOptions } from './config'
import { Auth } from './core/auth'

export type * from './types'
export const { auth, signIn, signOut, handlers } = Auth(authOptions)
export {
  validateToken,
  invalidateToken,
  invalidateAllTokens,
} from './core/session'
export { hash, verify } from './core/password'
