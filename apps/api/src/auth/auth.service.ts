import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenType, PlanType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { LoginDto } from '../domain/login.dto';
import { RegisterDto } from '../domain/register.dto';
import { isPendingInviteName } from '../common/utils/pending-invite';
import { PrismaService } from '../prisma/prisma.service';
import { trialEndDate } from '../subscriptions/plan-limits';
import { AuthEmailService } from './auth-email.service';
import { AuthTokensService } from './auth-tokens.service';
import { WelcomeEmailService } from './welcome-email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private welcomeEmail: WelcomeEmailService,
    private authEmail: AuthEmailService,
    private authTokens: AuthTokensService,
    private config: ConfigService,
  ) {}

  // ──────────────────────────────────────────────
  // REGISTRO: crea usuario + iglesia (tenant) + membresía ADMIN
  // ──────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.toLowerCase()
    let userNameForWelcome = dto.name

    if (dto.inviteToken) {
      const invite = await this.prisma.churchInvite.findUnique({
        where: { token: dto.inviteToken },
      })

      if (!invite) {
        throw new NotFoundException('Invitación no encontrada')
      }

      if (invite.acceptedAt) {
        throw new ConflictException('Esta invitación ya fue utilizada')
      }

      if (invite.expiresAt < new Date()) {
        throw new ConflictException('Esta invitación ha expirado')
      }

      if (invite.email !== normalizedEmail) {
        throw new ConflictException('El email no coincide con la invitación')
      }

      const existingInvitedUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          memberships: {
            where: { churchId: invite.churchId },
            take: 1,
          },
        },
      })

      if (existingInvitedUser) {
        const existingMembership = existingInvitedUser.memberships[0]
        const isPendingInvite =
          isPendingInviteName(existingInvitedUser.name) && Boolean(existingMembership)

        if (!isPendingInvite) {
          throw new ConflictException('El email ya está registrado')
        }

        const passwordHash = await bcrypt.hash(dto.password, 12)
        const updatedUser = await this.prisma.user.update({
          where: { id: existingInvitedUser.id },
          data: {
            name: dto.name,
            passwordHash,
            // The invite link arrived at this email, so it is verified.
            emailVerifiedAt: new Date(),
          },
        })
        userNameForWelcome = updatedUser.name

        await this.prisma.churchInvite.update({
          where: { token: dto.inviteToken },
          data: { acceptedAt: new Date() },
        })

        return this.issueTokens(
          updatedUser.id,
          updatedUser.email,
          invite.churchId,
          existingMembership.role,
        )
      }

      const passwordHash = await bcrypt.hash(dto.password, 12)

      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            name: dto.name,
            emailVerifiedAt: new Date(),
          },
        })

        const membership = await tx.membership.create({
          data: {
            userId: user.id,
            churchId: invite.churchId,
            role: invite.role,
          },
        })

        await tx.churchInvite.update({
          where: { token: dto.inviteToken },
          data: { acceptedAt: new Date() },
        })

        return { user, membership }
      })

      return this.issueTokens(
        result.user.id,
        result.user.email,
        invite.churchId,
        result.membership.role,
      )
    }

    if (!dto.churchName) {
      throw new ConflictException('El nombre de iglesia es obligatorio')
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { name: true },
    })

    if (existing) {
      // A pending invite can only be claimed with its invite link: the token
      // proves the person controls the invited email. Claiming it here would
      // let anyone who knows the email take over the invited role.
      if (isPendingInviteName(existing.name)) {
        throw new ConflictException(
          'Este email tiene una invitación pendiente. Usa el enlace que te llegó por email para unirte.',
        )
      }

      throw new ConflictException('El email ya está registrado')
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const slug = this.generateSlug(dto.churchName)

    // Transacción: crear usuario + iglesia + membresía + suscripción FREE
    const result = await this.prisma.$transaction(async (tx) => {
      // Verificar que el slug sea único
      let finalSlug = slug
      const existingChurch = await tx.church.findUnique({ where: { slug } })
      if (existingChurch) finalSlug = `${slug}-${Date.now()}`

      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name: dto.name,
        },
      })
      userNameForWelcome = user.name

      const church = await tx.church.create({
        data: {
          name: dto.churchName!,
          slug: finalSlug,
          // Toda iglesia nueva arranca en FREE con prueba de 30 días.
          subscription: {
            create: { plan: PlanType.FREE, status: 'ACTIVE', trialEndsAt: trialEndDate() },
          },
          instruments: {
            createMany: {
              data: [
                { name: 'Guitarra', icon: '🎸', sortOrder: 1 },
                { name: 'Bajo', icon: '🎸', sortOrder: 2 },
                { name: 'Piano/Teclado', icon: '🎹', sortOrder: 3 },
                { name: 'Batería', icon: '🥁', sortOrder: 4 },
                { name: 'Voz Principal', icon: '🎤', sortOrder: 5 },
                { name: 'Coros', icon: '🎵', sortOrder: 6 },
              ],
            },
          },
        },
      })

      // Membresía del fundador como ADMIN
      const membership = await tx.membership.create({
        data: { userId: user.id, churchId: church.id, role: 'ADMIN' },
      })

      return { user, church, membership }
    })

    // New accounts confirm their email with a link; until email delivery is
    // configured, fall back to the plain welcome email.
    if (this.authEmail.isEnabled()) {
      const token = await this.authTokens.issue(result.user.id, AuthTokenType.EMAIL_VERIFICATION)
      await this.authEmail.sendEmailVerification(result.user.email, userNameForWelcome, token)
    } else {
      await this.welcomeEmail.sendWelcomeEmail({
        email: result.user.email,
        name: userNameForWelcome,
      })
    }
    return this.issueTokens(result.user.id, result.user.email, result.church.id, 'ADMIN')
  }

  // ──────────────────────────────────────────────
  // LOGIN
  // ──────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        memberships: {
          include: { church: true },
          orderBy: { joinedAt: 'asc' },
        },
      },
    })

    if (!user) {
      this.logger.warn(`Intento de login fallido: email no encontrado (${dto.email})`)
      // Aquí podrías agregar lógica para alertar si hay muchos intentos fallidos desde una IP
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!passwordValid) {
      this.logger.warn(`Intento de login fallido: password incorrecto para ${dto.email}`)
      // Aquí podrías agregar lógica para alertar si hay muchos intentos fallidos desde una IP
      throw new UnauthorizedException('Credenciales inválidas')
    }

    if (user.memberships.length === 0) {
      this.logger.warn(`Usuario sin membresía intentó login: ${dto.email}`)
      throw new UnauthorizedException('No perteneces a ninguna iglesia')
    }

    const primaryMembership = user.memberships[0]

    return this.issueTokens(user.id, user.email, primaryMembership.churchId, primaryMembership.role)
  }

  // ──────────────────────────────────────────────
  // SWITCH CHURCH: cambiar de tenant activo
  // ──────────────────────────────────────────────
  async switchChurch(userId: string, churchId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_churchId: { userId, churchId } },
    })
    if (!membership) throw new NotFoundException('No eres miembro de esta iglesia')

    return this.issueTokens(userId, '', churchId, membership.role)
  }

  // ──────────────────────────────────────────────
  // REFRESH TOKEN
  // ──────────────────────────────────────────────
  async refreshTokens(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken)

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            memberships: { orderBy: { joinedAt: 'asc' }, take: 1 },
          },
        },
      },
    })

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.prisma.refreshToken.delete({ where: { tokenHash } })
      }
      throw new UnauthorizedException('Refresh token inválido o expirado')
    }

    // Rotación: eliminar y crear nuevo refresh token
    await this.prisma.refreshToken.delete({ where: { tokenHash } })

    const membership = stored.user.memberships[0]

    return this.issueTokens(stored.userId, stored.user.email, membership.churchId, membership.role)
  }

  // ──────────────────────────────────────────────
  // LOGOUT
  // ──────────────────────────────────────────────
  async logout(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken)
    await this.prisma.refreshToken.delete({ where: { tokenHash } }).catch(() => null) // Silencioso si ya no existe
  }

  // ──────────────────────────────────────────────
  // HELPERS PRIVADOS
  // ──────────────────────────────────────────────
  private async issueTokens(userId: string, email: string, churchId: string, role: string) {
    // isPlatformAdmin only drives UI (showing the admin link); the API always
    // re-checks it from the database in PlatformAdminGuard.
    const flags = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isPlatformAdmin: true },
    })
    const payload = {
      sub: userId,
      email,
      churchId,
      role,
      ...(flags?.isPlatformAdmin ? { isPlatformAdmin: true } : {}),
    }

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
    })

    const rawRefreshToken = crypto.randomBytes(48).toString('hex')
    const tokenHash = this.hashToken(rawRefreshToken)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    })

    return { accessToken, refreshToken: rawRefreshToken }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)
  }
}
