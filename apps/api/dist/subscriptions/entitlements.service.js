"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitlementsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const plan_limits_1 = require("./plan-limits");
let EntitlementsService = class EntitlementsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLimits(churchId) {
        const sub = await this.prisma.subscription.findUnique({
            where: { churchId },
            select: { plan: true },
        });
        return (0, plan_limits_1.getPlanLimits)(sub?.plan ?? client_1.PlanType.FREE);
    }
    async getSnapshot(churchId) {
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
            throw new common_1.NotFoundException("Suscripción no encontrada");
        }
        const limits = (0, plan_limits_1.getPlanLimits)(sub.plan);
        const [membersCount, songsCount, instrumentsCount] = await this.prisma.$transaction([
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
    async assertCanAddMember(churchId) {
        const limits = await this.getLimits(churchId);
        if (limits.maxMembers === -1)
            return;
        const count = await this.prisma.membership.count({ where: { churchId } });
        this.assertWithinLimit(count, limits.maxMembers, "miembros");
    }
    async assertCanAddSong(churchId) {
        const limits = await this.getLimits(churchId);
        if (limits.maxSongs === -1)
            return;
        const count = await this.prisma.song.count({ where: { churchId } });
        this.assertWithinLimit(count, limits.maxSongs, "canciones");
    }
    async assertCanAddInstrument(churchId) {
        const limits = await this.getLimits(churchId);
        if (limits.maxInstruments === -1)
            return;
        const count = await this.prisma.instrument.count({ where: { churchId } });
        this.assertWithinLimit(count, limits.maxInstruments, "instrumentos");
    }
    toQuota(used, limit) {
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
    assertWithinLimit(current, limit, resource) {
        if (current >= limit) {
            throw new common_1.ForbiddenException(`Tu plan permite un máximo de ${limit} ${resource}. Actualiza tu plan para agregar más.`);
        }
    }
};
exports.EntitlementsService = EntitlementsService;
exports.EntitlementsService = EntitlementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EntitlementsService);
//# sourceMappingURL=entitlements.service.js.map