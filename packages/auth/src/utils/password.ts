import { sha3_256 } from '@oslojs/crypto/sha3'
import { encodeBase32LowerCase } from '@oslojs/encoding'

export class Password {
  public hash(password: string): string {
    return encodeBase32LowerCase(sha3_256(new TextEncoder().encode(password)))
  }

  public verify(password: string, hash: string): boolean {
    const hashPassword = encodeBase32LowerCase(
      sha3_256(new TextEncoder().encode(password)),
    )
    return hashPassword === hash
  }
}
