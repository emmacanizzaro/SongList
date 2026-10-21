import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { AuthTokenType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { isPendingInviteName } from '../common/utils/pending-invite'
import { PrismaService } from '../prisma/prisma.service'
import { AuthEmailService } from './auth-email.service'
import { AuthTokensService } from './auth-tokens.service'

const INVALID_LINK = 'El enlace no es válido o ya venció. Pide uno nuevo.'

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly authEmail: AuthEmailService,
    private readonly authTokens: AuthTokensService,
  ) {}

  /**
   * Always resolves the same way whether or not the email exists, so this
   * endpoint cannot be used to find out who has an account.
   */
  async requestPasswordReset(email: string) {
    if (!this.authEmail.isEnabled()) {
      throw new ServiceUnavailableException(
        'La recuperación de contraseña todavía no está disponible. Contacta al administrador.',
      )
    }

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true },
    })

    // Pending invitees have no password yet: they must use their invite link.
    if (user && !isPendingInviteName(user.name)) {
      const token = await this.authTokens.issue(user.id, AuthTokenType.PASSWORD_RESET)
      await this.authEmail.sendPasswordReset(user.email, user.name, token)
    }

    return {
      message: 'Si el email está registrado, te enviamos un enlace para restablecer tu contraseña.',
    }
  }

  async resetPassword(token: string, password: string) {
    const userId = await this.authTokens.consume(token, AuthTokenType.PASSWORD_RESET)
    if (!userId) throw new BadRequestException(INVALID_LINK)

    const passwordHash = await bcrypt.hash(password, 12)
    const now = new Date()

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        // Receiving the reset link also proves the email belongs to them.
        data: { passwordHash, emailVerifiedAt: now },
      }),
      // Sign out every session: whoever knew the old password loses access.
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
    ])

    this.logger.log(`Password reset for user ${userId}`)
    return { message: 'Tu contraseña se actualizó. Ya puedes iniciar sesión.' }
  }

  async verifyEmail(token: string) {
    const userId = await this.authTokens.consume(token, AuthTokenType.EMAIL_VERIFICATION)
    if (!userId) throw new BadRequestException(INVALID_LINK)

    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    })

    return { message: 'Tu email quedó confirmado.' }
  }

  async resendVerification(userId: string) {
    if (!this.authEmail.isEnabled()) {
      throw new ServiceUnavailableException('El envío de emails todavía no está disponible.')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, emailVerifiedAt: true },
    })
    if (!user) throw new BadRequestException('Usuario no encontrado')
    if (user.emailVerifiedAt) return { message: 'Tu email ya está confirmado.' }

    const token = await this.authTokens.issue(userId, AuthTokenType.EMAIL_VERIFICATION)
    await this.authEmail.sendEmailVerification(user.email, user.name, token)
    return { message: 'Te enviamos un nuevo enlace de confirmación.' }
  }

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerifiedAt: true },
    })

    return {
      emailVerified: Boolean(user?.emailVerifiedAt),
      emailDeliveryEnabled: this.authEmail.isEnabled(),
    }
  }
}
