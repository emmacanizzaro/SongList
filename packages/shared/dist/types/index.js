"use strict";
// ─────────────────────────────────────────────
//  Enums compartidos (deben coincidir con schema.prisma)
// ─────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_LIMITS = exports.VersionType = exports.SubscriptionStatus = exports.PlanType = exports.MemberRole = void 0;
var MemberRole;
(function (MemberRole) {
    MemberRole["ADMIN"] = "ADMIN";
    MemberRole["EDITOR"] = "EDITOR";
    MemberRole["READER"] = "READER";
})(MemberRole || (exports.MemberRole = MemberRole = {}));
var PlanType;
(function (PlanType) {
    PlanType["FREE"] = "FREE";
    PlanType["PRO"] = "PRO";
    PlanType["ENTERPRISE"] = "ENTERPRISE";
})(PlanType || (exports.PlanType = PlanType = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["TRIALING"] = "TRIALING";
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["PAST_DUE"] = "PAST_DUE";
    SubscriptionStatus["CANCELED"] = "CANCELED";
    SubscriptionStatus["UNPAID"] = "UNPAID";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
var VersionType;
(function (VersionType) {
    VersionType["ORIGINAL"] = "ORIGINAL";
    VersionType["MALE_KEY"] = "MALE_KEY";
    VersionType["FEMALE_KEY"] = "FEMALE_KEY";
    VersionType["CUSTOM"] = "CUSTOM";
})(VersionType || (exports.VersionType = VersionType = {}));
exports.PLAN_LIMITS = {
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
//# sourceMappingURL=index.js.map