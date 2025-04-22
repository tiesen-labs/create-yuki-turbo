import { sha256 } from '@oslojs/crypto/sha2'
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding'

import type { User } from '@yuki/db'
import { db, Session as DbSession, eq } from '@yuki/db'

export class Session {
  private readonly db: typeof db
  private readonly EXPIRATION_TIME

  constructor() {
    this.EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30 // 30 days
    this.db = db
  }

  private generateSessionToken(): string {
    const bytes = new Uint8Array(20)
    crypto.getRandomValues(bytes)
    const token = encodeBase32LowerCaseNoPadding(bytes)
    return token
  }

  public async createSession(
    userId: string,
  ): Promise<{ sessionToken: string; expires: Date }> {
    const token = this.generateSessionToken()
    const sessionToken = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token)),
    )

    const [session] = await this.db
      .insert(DbSession)
      .values({
        sessionToken,
        expires: new Date(Date.now() + this.EXPIRATION_TIME),
        userId,
      })
      .returning()

    if (!session) throw new Error('Failed to create session')
    return { sessionToken: token, expires: session.expires }
  }

  public async validateSessionToken(token: string): Promise<SessionResult> {
    const sessionToken = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token)),
    )

    const result = await this.db.query.Session.findFirst({
      where: eq(DbSession.sessionToken, sessionToken),
      with: { user: true },
    })

    if (!result) return { expires: new Date() }

    const { user, ...session } = result

    if (Date.now() > session.expires.getTime()) {
      await this.db
        .delete(DbSession)
        .where(eq(DbSession.sessionToken, sessionToken))
      return { expires: new Date() }
    }

    if (Date.now() >= session.expires.getTime() - this.EXPIRATION_TIME / 2) {
      session.expires = new Date(Date.now() + this.EXPIRATION_TIME)
      await this.db
        .update(DbSession)
        .set({ expires: session.expires })
        .where(eq(DbSession.sessionToken, sessionToken))
    }

    return { user, expires: session.expires }
  }

  public async invalidateSessionToken(token: string): Promise<void> {
    const sessionToken = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token)),
    )
    await this.db
      .delete(DbSession)
      .where(eq(DbSession.sessionToken, sessionToken))
  }

  public async invalidateAllSessionTokens(userId: string): Promise<void> {
    await this.db.delete(DbSession).where(eq(DbSession.userId, userId))
  }
}

export interface SessionResult {
  user?: typeof User.$inferSelect
  expires: Date
}
