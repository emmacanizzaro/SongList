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
exports.InstrumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
let InstrumentsService = class InstrumentsService {
    constructor(prisma, subscriptions) {
        this.prisma = prisma;
        this.subscriptions = subscriptions;
    }
    async findAll(churchId) {
        return this.prisma.instrument.findMany({
            where: { churchId },
            include: { _count: { select: { assignments: true } } },
            orderBy: { sortOrder: "asc" },
        });
    }
    async create(churchId, name, icon) {
        const limits = await this.subscriptions.getLimits(churchId);
        if (limits.maxInstruments !== -1) {
            const count = await this.prisma.instrument.count({ where: { churchId } });
            if (count >= limits.maxInstruments) {
                throw new common_1.ForbiddenException(`Tu plan permite un máximo de ${limits.maxInstruments} instrumentos. Actualiza tu plan para agregar más.`);
            }
        }
        const existing = await this.prisma.instrument.findUnique({
            where: { churchId_name: { churchId, name } },
        });
        if (existing)
            throw new common_1.ConflictException(`Ya existe el instrumento "${name}"`);
        const count = await this.prisma.instrument.count({ where: { churchId } });
        return this.prisma.instrument.create({
            data: { churchId, name, icon, sortOrder: count + 1 },
        });
    }
    async update(churchId, id, name, icon) {
        await this.assertBelongsToChurch(id, churchId);
        return this.prisma.instrument.update({
            where: { id },
            data: { name, icon },
        });
    }
    async remove(churchId, id) {
        await this.assertBelongsToChurch(id, churchId);
        return this.prisma.instrument.delete({ where: { id } });
    }
    async reorder(churchId, orderedIds) {
        await this.prisma.$transaction(orderedIds.map((id, index) => this.prisma.instrument.updateMany({
            where: { id, churchId },
            data: { sortOrder: index + 1 },
        })));
        return this.findAll(churchId);
    }
    async assertBelongsToChurch(id, churchId) {
        const instrument = await this.prisma.instrument.findFirst({
            where: { id, churchId },
        });
        if (!instrument)
            throw new common_1.NotFoundException("Instrumento no encontrado");
    }
};
exports.InstrumentsService = InstrumentsService;
exports.InstrumentsService = InstrumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscriptions_service_1.SubscriptionsService])
], InstrumentsService);
//# sourceMappingURL=instruments.service.js.map