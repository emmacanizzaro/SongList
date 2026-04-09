import { PlanType } from '@prisma/client';
export interface PlanLimits {
    maxMembers: number;
    maxSongs: number;
    maxInstruments: number;
    historyMonths: number;
    canExportPdf: boolean;
    canShareLinks: boolean;
    canMultiTeam: boolean;
    supportPriority: 'community' | 'email' | 'priority';
}
export declare const PLAN_LIMITS: Record<PlanType, PlanLimits>;
export declare function getPlanLimits(plan: PlanType): PlanLimits;
