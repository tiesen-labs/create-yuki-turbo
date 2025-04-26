import { sha256 } from '@oslojs/crypto/sha2'
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding'

import type { User } from '@yuki/db'
import { db as database } from '@yuki/db'

export class Session {
  private readonly TOKEN_BYTES = 20
  private readonly SESSION_EXPIRATION = 1000 * 60 * 60 * 24 * 30 // 30 days
  private readonly SESSION_REFRESH_THRESHOLD = this.SESSION_EXPIRATION / 2 // 15 days

  constructor(private readonly db = database) {}

  public async create(
    userId: string,
  ): Promise<{ sessionToken: string; expires: Date }> {
    const token = this.generateToken()
    const sessionToken = this.hashToken(token)
    const expires = new Date(Date.now() + this.SESSION_EXPIRATION)

    const session = await this.db.session.create({
      data: { sessionToken, expires, userId },
    })

    return { sessionToken: token, expires: session.expires }
  }

  public async validateToken(token: string): Promise<SessionResult> {
    const sessionToken = this.hashToken(token)

    const result = await this.db.session.findFirst({
      where: { sessionToken },
      include: { user: true },
    })

    if (!result) return { expires: new Date() }

    const { user, ...session } = result
    const now = Date.now()

    if (now > session.expires.getTime()) {
      await this.delete(sessionToken)
      return { expires: new Date() }
    }

    if (now >= session.expires.getTime() - this.SESSION_REFRESH_THRESHOLD) {
      const newExpires = new Date(Date.now() + this.SESSION_EXPIRATION)
      await this.db.session.update({
        where: { sessionToken },
        data: { expires: newExpires },
      })
      session.expires = newExpires
    }

    return { user, expires: session.expires }
  }

  public async invalidateToken(token: string): Promise<void> {
    await this.delete(this.hashToken(token))
  }

  public async invalidateAllTokens(userId: string): Promise<void> {
    await this.db.session.deleteMany({ where: { userId } })
  }

  private generateToken(): string {
    const bytes = new Uint8Array(this.TOKEN_BYTES)
    crypto.getRandomValues(bytes)
    const token = encodeBase32LowerCaseNoPadding(bytes)
    return token
  }

  private hashToken(token: string): string {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  }

  private async delete(sessionToken: string): Promise<void> {
    await this.db.session.delete({ where: { sessionToken } })
  }
}

export interface SessionResult {
  user?: User
  expires: Date
}
