import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { MailerService } from '../../common/services/mailer.service'
import { PrismaService } from '../../prisma/prisma.service'

/**
 * Requires a confirmed email for sensitive actions (inviting people).
 * Only enforced once email delivery is configured; before that nobody could
 * confirm their email, so enforcing it would just lock everyone out.
 */
@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.mailer.isConfigured()) return true

    const userId: string | undefined = context.switchToHttp().getRequest().user?.id
    if (!userId) return true

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerifiedAt: true },
    })
    if (user?.emailVerifiedAt) return true

    throw new ForbiddenException({
      statusCode: 403,
      error: 'Forbidden',
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Confirma tu email para poder invitar miembros. Revisa tu bandeja de entrada.',
    })
  }
}
