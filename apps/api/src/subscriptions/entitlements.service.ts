import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PlanType, SubscriptionStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { getPlanLimits, PlanLimits } from "./plan-limits";

interface QuotaSnapshot {
  used: number;
  limit: number;
  remaining: number | null;
  unlimited: boolean;
}

export interface EntitlementsSnapshot {
  plan: PlanType;
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
  limits: PlanLimits;
  features: {
    canExportPdf: boolean;
    canShareLinks: boolean;
    canMultiTeam: boolean;
  };
  quotas: {
    members: QuotaSnapshot;
    songs: QuotaSnapshot;
    instruments: QuotaSnapshot;
  };
}

@Injectable()
export class EntitlementsService {
  constructor(private prisma: PrismaService) {}

  async getLimits(churchId: string): Promise<PlanLimits> {
    const sub = await this.prisma.subscription.findUnique({
      where: { churchId },
      select: { plan: true },
    });

    return getPlanLimits(sub?.plan ?? PlanType.FREE);
  }

  async getSnapshot(churchId: string): Promise<EntitlementsSnapshot> {
    const sub = await this.prisma.subscription.findUnique({
      where: { churchId },
      select: {
        plan: true,
        status: true,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: true,
      },
    });

    if (!sub) {
      throw new NotFoundException("Suscripción no encontrada");
    }

    const limits = getPlanLimits(sub.plan);

    const [membersCount, songsCount, instrumentsCount] =
      await this.prisma.$transaction([
        this.prisma.membership.count({ where: { churchId } }),
        this.prisma.song.count({ where: { churchId } }),
        this.prisma.instrument.count({ where: { churchId } }),
      ]);

    return {
      plan: sub.plan,
      status: sub.status,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      currentPeriodEnd: sub.currentPeriodEnd,
      limits,
      features: {
        canExportPdf: limits.canExportPdf,
        canShareLinks: limits.canShareLinks,
        canMultiTeam: limits.canMultiTeam,
      },
      quotas: {
        members: this.toQuota(membersCount, limits.maxMembers),
        songs: this.toQuota(songsCount, limits.maxSongs),
        instruments: this.toQuota(instrumentsCount, limits.maxInstruments),
      },
    };
  }

  async assertCanAddMember(churchId: string) {
    const limits = await this.getLimits(churchId);

    if (limits.maxMembers === -1) return;

    const count = await this.prisma.membership.count({ where: { churchId } });
    this.assertWithinLimit(count, limits.maxMembers, "miembros");
  }

  async assertCanAddSong(churchId: string) {
    const limits = await this.getLimits(churchId);

    if (limits.maxSongs === -1) return;

    const count = await this.prisma.song.count({ where: { churchId } });
    this.assertWithinLimit(count, limits.maxSongs, "canciones");
  }

  async assertCanAddInstrument(churchId: string) {
    const limits = await this.getLimits(churchId);

    if (limits.maxInstruments === -1) return;

    const count = await this.prisma.instrument.count({ where: { churchId } });
    this.assertWithinLimit(count, limits.maxInstruments, "instrumentos");
  }

  private toQuota(used: number, limit: number): QuotaSnapshot {
    if (limit === -1) {
      return {
        used,
        limit,
        remaining: null,
        unlimited: true,
      };
    }

    return {
      used,
      limit,
      remaining: Math.max(limit - used, 0),
      unlimited: false,
    };
  }

  private assertWithinLimit(current: number, limit: number, resource: string) {
    if (current >= limit) {
      throw new ForbiddenException(
        `Tu plan permite un máximo de ${limit} ${resource}. Actualiza tu plan para agregar más.`,
      );
    }
  }
}
