"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_LIMITS = void 0;
exports.getPlanLimits = getPlanLimits;
const client_1 = require("@prisma/client");
exports.PLAN_LIMITS = {
    [client_1.PlanType.FREE]: {
        maxMembers: 5,
        maxSongs: 50,
        maxInstruments: 6,
        historyMonths: 3,
        canExportPdf: false,
        canShareLinks: true,
        canMultiTeam: false,
        supportPriority: 'community',
    },
    [client_1.PlanType.PRO]: {
        maxMembers: -1,
        maxSongs: -1,
        maxInstruments: 30,
        historyMonths: -1,
        canExportPdf: true,
        canShareLinks: true,
        canMultiTeam: false,
        supportPriority: 'email',
    },
    [client_1.PlanType.ENTERPRISE]: {
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
function getPlanLimits(plan) {
    return exports.PLAN_LIMITS[plan];
}
//# sourceMappingURL=plan-limits.js.map