/*
MIT License

Copyright (c) 2023 pilcrowOnPaper

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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
