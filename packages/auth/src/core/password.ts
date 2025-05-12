import { sha3_512 } from '@oslojs/crypto/sha3'
import { encodeHexLowerCase } from '@oslojs/encoding'

/**
 * Secret key used for password hashing
 * Must be set in environment variables
 */
const AUTH_SECRET = process.env.AUTH_SECRET

function hash(password: string): string {
  // Salt the password with the authentication secret
  const salted = `${password}${AUTH_SECRET}`

  // Convert the salted password to bytes, hash it, and encode as hex
  const passwordBytes = new TextEncoder().encode(salted)
  const hashedBytes = sha3_512(passwordBytes)
  const hashedHex = encodeHexLowerCase(hashedBytes)

  // Append the secret to the hash for additional security
  return `${hashedHex}${AUTH_SECRET}`
}

function verify(password: string, hashedPassword: string): boolean {
  return hash(password) === hashedPassword
}

export { hash, verify }
