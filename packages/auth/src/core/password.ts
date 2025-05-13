import { constantTimeEqual } from '@oslojs/crypto/subtle'
import { decodeHex, encodeHexLowerCase } from '@oslojs/encoding'

export class Password {
  private iterations: number
  private dkLen: number

  constructor(options?: { N?: number; p?: number; dkLen?: number }) {
    this.iterations = (options?.N ?? 16384) * (options?.p ?? 1)
    this.dkLen = options?.dkLen ?? 64
  }

  public async hash(password: string): Promise<string> {
    const salt = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(16)))
    const key = await this.generateKey(password, salt)
    return `${salt}:${encodeHexLowerCase(key)}`
  }

  public async verify(hash: string, password: string): Promise<boolean> {
    const [salt, key] = hash.split(':')
    const targetKey = await this.generateKey(password, salt ?? '')
    return constantTimeEqual(targetKey, decodeHex(key ?? ''))
  }

  private async generateKey(
    password: string,
    salt: string,
  ): Promise<Uint8Array> {
    const importedKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password.normalize('NFKC')),
      { name: 'PBKDF2' },
      false,
      ['deriveBits'],
    )

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: decodeHex(salt),
        iterations: this.iterations,
        hash: 'SHA-256',
      },
      importedKey,
      this.dkLen * 8, // Convert bytes to bits
    )

    return new Uint8Array(derivedBits)
  }
}
