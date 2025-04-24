import { sha256 } from '@oslojs/crypto/sha2'
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding'

import type { users } from '@yuki/db/schema'
import { db, eq } from '@yuki/db'
import { sessions } from '@yuki/db/schema'

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
      .insert(sessions)
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

    const result = await this.db.query.sessions.findFirst({
      where: eq(sessions.sessionToken, sessionToken),
      with: { user: true },
    })

    if (!result) return { expires: new Date() }

    const { user, ...session } = result

    if (Date.now() > session.expires.getTime()) {
      await this.db
        .delete(sessions)
        .where(eq(sessions.sessionToken, sessionToken))
      return { expires: new Date() }
    }

    if (Date.now() >= session.expires.getTime() - this.EXPIRATION_TIME / 2) {
      session.expires = new Date(Date.now() + this.EXPIRATION_TIME)
      await this.db
        .update(sessions)
        .set({ expires: session.expires })
        .where(eq(sessions.sessionToken, sessionToken))
    }

    return { user, expires: session.expires }
  }

  public async invalidateSessionToken(token: string): Promise<void> {
    const sessionToken = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token)),
    )
    await this.db
      .delete(sessions)
      .where(eq(sessions.sessionToken, sessionToken))
  }

  public async invalidateAllSessionTokens(userId: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.userId, userId))
  }
}

export interface SessionResult {
  user?: typeof users.$inferSelect
  expires: Date
}
