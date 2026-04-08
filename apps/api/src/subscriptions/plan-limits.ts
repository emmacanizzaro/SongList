import { PlanType } from '@prisma/client';

// ============================================================
// LÍMITES POR PLAN - Fuente única de verdad para el negocio
// ============================================================

export interface PlanLimits {
  maxMembers: number;          // -1 = ilimitado
  maxSongs: number;            // -1 = ilimitado
  maxInstruments: number;
  historyMonths: number;       // Meses de historial de reuniones
  canExportPdf: boolean;
  canShareLinks: boolean;
  canMultiTeam: boolean;
  supportPriority: 'community' | 'email' | 'priority';
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.FREE]: {
    maxMembers: 5,
    maxSongs: 50,
    maxInstruments: 6,
    historyMonths: 3,
    canExportPdf: false,
    canShareLinks: true,
    canMultiTeam: false,
    supportPriority: 'community',
  },
  [PlanType.PRO]: {
    maxMembers: -1,
    maxSongs: -1,
    maxInstruments: 30,
    historyMonths: -1,
    canExportPdf: true,
    canShareLinks: true,
    canMultiTeam: false,
    supportPriority: 'email',
  },
  [PlanType.ENTERPRISE]: {
    maxMembers: -1,
    maxSongs: -1,
    maxInstruments: -1,
    historyMonths: -1,
    canExportPdf: true,
    canShareLinks: true,
    canMultiTeam: true,
    supportPriority: 'priority',
  },
};

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan];
}
