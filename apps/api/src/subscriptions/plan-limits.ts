import { PlanType } from "@prisma/client";

// ============================================================
// LÍMITES POR PLAN - Fuente única de verdad para el negocio
// ============================================================

export interface PlanLimits {
  maxMembers: number; // -1 = ilimitado
  maxSongs: number; // -1 = ilimitado
  maxInstruments: number;
  historyMonths: number; // Meses de historial de reuniones
  canExportPdf: boolean;
  canShareLinks: boolean;
  canMultiTeam: boolean;
  supportPriority: "community" | "email" | "priority";
}

/** Duración de la prueba gratuita del plan FREE. */
export const FREE_TRIAL_DAYS = 30;

/** Precio mensual en USD. null = no se vende (plan interno o gratuito). */
export const PLAN_PRICES_USD: Record<PlanType, number | null> = {
  [PlanType.FREE]: null,
  [PlanType.PRO]: 9.99,
  [PlanType.ENTERPRISE]: 19.99,
  [PlanType.UNLIMITED]: null,
};

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.FREE]: {
    maxMembers: 10,
    maxSongs: 20,
    maxInstruments: 6,
    historyMonths: 3,
    canExportPdf: false,
    canShareLinks: false,
    canMultiTeam: false,
    supportPriority: "community",
  },
  [PlanType.PRO]: {
    maxMembers: 30,
    maxSongs: 50,
    maxInstruments: 30,
    historyMonths: -1,
    canExportPdf: true,
    canShareLinks: true,
    canMultiTeam: false,
    supportPriority: "email",
  },
  [PlanType.ENTERPRISE]: {
    maxMembers: 60,
    maxSongs: 150,
    maxInstruments: -1,
    historyMonths: -1,
    canExportPdf: true,
    canShareLinks: true,
    canMultiTeam: true,
    supportPriority: "priority",
  },
  // Plan interno del dueño de la plataforma: sin límites ni vencimiento.
  [PlanType.UNLIMITED]: {
    maxMembers: -1,
    maxSongs: -1,
    maxInstruments: -1,
    historyMonths: -1,
    canExportPdf: true,
    canShareLinks: true,
    canMultiTeam: true,
    supportPriority: "priority",
  },
};

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan];
}

export type AccessState = "active" | "trial_expired" | "period_expired";

/**
 * Decide si la iglesia puede escribir o queda en solo lectura.
 * - FREE: activa hasta `trialEndsAt`.
 * - PRO / ENTERPRISE (cobro manual): activa hasta `currentPeriodEnd`, si está cargado.
 * - UNLIMITED: siempre activa.
 */
export function getAccessState(
  sub: {
    plan: PlanType;
    trialEndsAt: Date | null;
    currentPeriodEnd: Date | null;
  },
  now: Date = new Date(),
): AccessState {
  if (sub.plan === PlanType.UNLIMITED) return "active";

  if (sub.plan === PlanType.FREE) {
    return sub.trialEndsAt && sub.trialEndsAt < now ? "trial_expired" : "active";
  }

  return sub.currentPeriodEnd && sub.currentPeriodEnd < now
    ? "period_expired"
    : "active";
}

export function trialEndDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);
}
