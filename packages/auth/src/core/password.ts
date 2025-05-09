import { sha3_512 } from '@oslojs/crypto/sha3'
import { encodeHexLowerCase } from '@oslojs/encoding'

function hash(password: string): string {
  const salted = `${password}${process.env.AUTH_SECRET}`
  return `${encodeHexLowerCase(sha3_512(new TextEncoder().encode(salted)))}${process.env.AUTH_SECRET}`
}

function verify(password: string, hashedPassword: string): boolean {
  return hash(password) === hashedPassword
}

export { hash, verify }
