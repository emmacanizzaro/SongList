import { Injectable } from '@nestjs/common'
import { AuthTokenType } from '@prisma/client'
import * as crypto from 'crypto'
import { PrismaService } from '../prisma/prisma.service'

export const TOKEN_TTL_MS: Record<AuthTokenType, number> = {
  [AuthTokenType.EMAIL_VERIFICATION]: 24 * 60 * 60 * 1000,
  [AuthTokenType.PASSWORD_RESET]: 60 * 60 * 1000,
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/** Single-use tokens sent by email. Only their SHA-256 hash is stored. */
@Injectable()
export class AuthTokensService {
  constructor(private readonly prisma: PrismaService) {}

  /** Creates a new token and invalidates any earlier unused one of the same type. */
  async issue(userId: string, type: AuthTokenType): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex')
    const now = new Date()

    await this.prisma.$transaction([
      this.prisma.authToken.updateMany({
        where: { userId, type, usedAt: null },
        data: { usedAt: now },
      }),
      this.prisma.authToken.create({
        data: {
          userId,
          type,
          tokenHash: hashToken(token),
          expiresAt: new Date(now.getTime() + TOKEN_TTL_MS[type]),
        },
      }),
    ])

    return token
  }

  /**
   * Marks the token as used and returns its userId, or null when the token is
   * unknown, of another type, expired or already used. The conditional update
   * makes it safe against two concurrent uses of the same link.
   */
  async consume(token: string, type: AuthTokenType): Promise<string | null> {
    const now = new Date()
    const record = await this.prisma.authToken.findUnique({
      where: { tokenHash: hashToken(token) },
      select: { id: true, userId: true, type: true, usedAt: true, expiresAt: true },
    })

    if (!record || record.type !== type || record.usedAt || record.expiresAt < now) {
      return null
    }

    const { count } = await this.prisma.authToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: now },
    })

    return count === 1 ? record.userId : null
  }
}
