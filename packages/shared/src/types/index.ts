// ─────────────────────────────────────────────
//  Enums compartidos (deben coincidir con schema.prisma)
// ─────────────────────────────────────────────

export enum MemberRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  READER = 'READER',
}

export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  UNPAID = 'UNPAID',
}

export enum VersionType {
  ORIGINAL = 'ORIGINAL',
  MALE_KEY = 'MALE_KEY',
  FEMALE_KEY = 'FEMALE_KEY',
  CUSTOM = 'CUSTOM',
}

// ─────────────────────────────────────────────
//  Interfaces de dominio compartidas
// ─────────────────────────────────────────────

export interface PlanLimits {
  maxMembers: number;       // -1 = ilimitado
  maxSongs: number;         // -1 = ilimitado
  maxInstruments: number;   // -1 = ilimitado
  meetingHistoryMonths: number; // -1 = ilimitado
  canExportPDF: boolean;
  canShareLinks: boolean;
  canUseMultiTeams: boolean;
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.FREE]: {
    maxMembers: 5,
    maxSongs: 50,
    maxInstruments: 6,
    meetingHistoryMonths: 3,
    canExportPDF: false,
    canShareLinks: true,
    canUseMultiTeams: false,
    prioritySupport: false,
  },
  [PlanType.PRO]: {
    maxMembers: -1,
    maxSongs: -1,
    maxInstruments: 30,
    meetingHistoryMonths: -1,
    canExportPDF: true,
    canShareLinks: true,
    canUseMultiTeams: false,
    prioritySupport: false,
  },
  [PlanType.ENTERPRISE]: {
    maxMembers: -1,
    maxSongs: -1,
    maxInstruments: -1,
    meetingHistoryMonths: -1,
    canExportPDF: true,
    canShareLinks: true,
    canUseMultiTeams: true,
    prioritySupport: true,
  },
};

// ─────────────────────────────────────────────
//  Payload del JWT
// ─────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  email: string;
  churchId: string;
  role: MemberRole;
  iat?: number;
  exp?: number;
}
