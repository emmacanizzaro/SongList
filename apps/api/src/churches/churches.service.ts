import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MemberRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { CreateChurchDto } from "./dto/create-church.dto";
import { InviteEmailService } from "./invite-email.service";

@Injectable()
export class ChurchesService {
  constructor(
    private prisma: PrismaService,
    private subscriptions: SubscriptionsService,
    private inviteEmail: InviteEmailService,
  ) {}

  async findById(churchId: string) {
    const church = await this.prisma.church.findUnique({
      where: { id: churchId },
      include: {
        subscription: true,
        _count: { select: { memberships: true, songs: true, meetings: true } },
      },
    });
    if (!church) throw new NotFoundException("Iglesia no encontrada");
    return church;
  }

  async update(churchId: string, dto: Partial<CreateChurchDto>) {
    return this.prisma.church.update({
      where: { id: churchId },
      data: dto,
    });
  }

  // ── Gestión de miembros ──────────────────────────────────

  async getMembers(churchId: string) {
    return this.prisma.membership.findMany({
      where: { churchId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { joinedAt: "asc" },
    });
  }

  async inviteMember(
    churchId: string,
    email: string,
    role: MemberRole,
    requestingRole: MemberRole,
  ) {
    if (requestingRole !== MemberRole.ADMIN) {
      throw new ForbiddenException(
        "Solo los administradores pueden invitar miembros",
      );
    }

    const limits = await this.subscriptions.getLimits(churchId);
    if (limits.maxMembers !== -1) {
      const count = await this.prisma.membership.count({ where: { churchId } });
      if (count >= limits.maxMembers) {
        throw new ForbiddenException(
          `Tu plan permite un máximo de ${limits.maxMembers} miembros. Actualiza tu plan para agregar más.`,
        );
      }
    }

    const normalizedEmail = email.toLowerCase();
    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Invitación pendiente: se crea usuario placeholder para reservar email y rol.
      const temporaryPassword = crypto.randomBytes(32).toString("hex");
      const temporaryHash = await bcrypt.hash(temporaryPassword, 12);

      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          name: `Invitado ${normalizedEmail}`,
          passwordHash: temporaryHash,
        },
      });
    }

    const existing = await this.prisma.membership.findUnique({
      where: { userId_churchId: { userId: user.id, churchId } },
    });
    if (existing)
      throw new ConflictException("El usuario ya es miembro de esta iglesia");

    return this.prisma.membership.create({
      data: { userId: user.id, churchId, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async createInviteLink(
    churchId: string,
    invitedByUserId: string,
    email: string,
    role: MemberRole,
    requestingRole: MemberRole,
  ) {
    if (requestingRole !== MemberRole.ADMIN) {
      throw new ForbiddenException(
        "Solo los administradores pueden crear invitaciones",
      );
    }

    const limits = await this.subscriptions.getLimits(churchId);
    if (limits.maxMembers !== -1) {
      const count = await this.prisma.membership.count({ where: { churchId } });
      if (count >= limits.maxMembers) {
        throw new ForbiddenException(
          `Tu plan permite un máximo de ${limits.maxMembers} miembros. Actualiza tu plan para agregar más.`,
        );
      }
    }

    const normalizedEmail = email.toLowerCase();
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      const existingMembership = await this.prisma.membership.findUnique({
        where: {
          userId_churchId: { userId: existingUser.id, churchId },
        },
      });
      if (existingMembership) {
        throw new ConflictException("Ese email ya pertenece a esta iglesia");
      }
    }

    await this.prisma.churchInvite.updateMany({
      where: {
        churchId,
        email: normalizedEmail,
        acceptedAt: null,
      },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const invite = await this.prisma.churchInvite.create({
      data: {
        churchId,
        email: normalizedEmail,
        role,
        token,
        invitedByUserId,
        expiresAt,
      },
      include: {
        church: { select: { name: true, slug: true } },
      },
    });

    const { emailSent, inviteUrl } = await this.inviteEmail.sendInviteEmail({
      email: invite.email,
      churchName: invite.church.name,
      role: invite.role,
      token: invite.token,
      expiresAt: invite.expiresAt,
    });

    return {
      token: invite.token,
      email: invite.email,
      role: invite.role,
      churchName: invite.church.name,
      expiresAt: invite.expiresAt,
      inviteUrl,
      emailSent,
    };
  }

  async getInviteByToken(token: string) {
    const invite = await this.prisma.churchInvite.findUnique({
      where: { token },
      include: { church: { select: { id: true, name: true, slug: true } } },
    });

    if (!invite) {
      throw new NotFoundException("Invitación no encontrada");
    }

    if (invite.acceptedAt) {
      throw new ConflictException("Esta invitación ya fue utilizada");
    }

    if (invite.expiresAt < new Date()) {
      throw new ConflictException("Esta invitación ha expirado");
    }

    return {
      email: invite.email,
      role: invite.role,
      churchName: invite.church.name,
      churchSlug: invite.church.slug,
      expiresAt: invite.expiresAt,
      token: invite.token,
    };
  }

  async updateMemberRole(churchId: string, memberId: string, role: MemberRole) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: memberId, churchId },
    });
    if (!membership) throw new NotFoundException("Membresía no encontrada");

    return this.prisma.membership.update({
      where: { id: memberId },
      data: { role },
    });
  }

  async removeMember(
    churchId: string,
    memberId: string,
    requestingUserId: string,
  ) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: memberId, churchId },
    });
    if (!membership) throw new NotFoundException("Membresía no encontrada");

    // No se puede expulsar al propio administrador
    if (membership.userId === requestingUserId) {
      throw new ForbiddenException(
        "No puedes eliminarte a ti mismo de la iglesia",
      );
    }

    return this.prisma.membership.delete({ where: { id: memberId } });
  }

  // ── Dashboard stats ──────────────────────────────────────

  async getDashboardStats(churchId: string) {
    const [membersCount, songsCount, meetingsCount, upcomingMeetings] =
      await this.prisma.$transaction([
        this.prisma.membership.count({ where: { churchId } }),
        this.prisma.song.count({ where: { churchId } }),
        this.prisma.meeting.count({ where: { churchId } }),
        this.prisma.meeting.findMany({
          where: { churchId, date: { gte: new Date() } },
          orderBy: { date: "asc" },
          take: 5,
          include: {
            meetingSongs: { include: { song: { select: { title: true } } } },
            _count: { select: { assignments: true } },
          },
        }),
      ]);

    return { membersCount, songsCount, meetingsCount, upcomingMeetings };
  }
}
