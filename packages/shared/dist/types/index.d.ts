export declare enum MemberRole {
    ADMIN = "ADMIN",
    EDITOR = "EDITOR",
    READER = "READER"
}
export declare enum PlanType {
    FREE = "FREE",
    PRO = "PRO",
    ENTERPRISE = "ENTERPRISE"
}
export declare enum SubscriptionStatus {
    TRIALING = "TRIALING",
    ACTIVE = "ACTIVE",
    PAST_DUE = "PAST_DUE",
    CANCELED = "CANCELED",
    UNPAID = "UNPAID"
}
export declare enum VersionType {
    ORIGINAL = "ORIGINAL",
    MALE_KEY = "MALE_KEY",
    FEMALE_KEY = "FEMALE_KEY",
    CUSTOM = "CUSTOM"
}
export interface PlanLimits {
    maxMembers: number;
    maxSongs: number;
    maxInstruments: number;
    meetingHistoryMonths: number;
    canExportPDF: boolean;
    canShareLinks: boolean;
    canUseMultiTeams: boolean;
    prioritySupport: boolean;
}
export declare const PLAN_LIMITS: Record<PlanType, PlanLimits>;
export interface JwtPayload {
    sub: string;
    email: string;
    churchId: string;
    role: MemberRole;
    iat?: number;
    exp?: number;
}
//# sourceMappingURL=index.d.ts.map