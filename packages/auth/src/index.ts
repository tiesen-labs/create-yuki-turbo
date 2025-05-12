import { authOptions } from './config'
import { Auth } from './core'

export type * from './types'
export const { auth, signIn, signOut, handlers } = Auth(authOptions)
export {
  validateToken,
  invalidateToken,
  invalidateAllTokens,
} from './core/queries'
export { hash, verify } from './core/password'
