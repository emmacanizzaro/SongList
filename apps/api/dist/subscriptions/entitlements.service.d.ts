import { PlanType, SubscriptionStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PlanLimits } from "./plan-limits";
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
export declare class EntitlementsService {
  private prisma;
  constructor(prisma: PrismaService);
  getLimits(churchId: string): Promise<PlanLimits>;
  getSnapshot(churchId: string): Promise<EntitlementsSnapshot>;
  assertCanAddMember(churchId: string): Promise<void>;
  assertCanAddSong(churchId: string): Promise<void>;
  assertCanAddInstrument(churchId: string): Promise<void>;
  private toQuota;
  private assertWithinLimit;
}
export {};
