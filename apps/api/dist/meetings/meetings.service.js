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
exports.MeetingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../prisma/prisma.service");
const MEETING_INCLUDE = client_1.Prisma.validator()({
    meetingSongs: {
        include: {
            song: {
                include: {
                    versions: { where: { type: client_1.VersionType.ORIGINAL } },
                },
            },
        },
        orderBy: { order: "asc" },
    },
    assignments: {
        include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            instrument: { select: { id: true, name: true, icon: true } },
        },
    },
});
let MeetingsService = class MeetingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(churchId, userId, dto) {
        return this.prisma.meeting.create({
            data: {
                churchId,
                title: dto.title,
                date: new Date(dto.date),
                notes: dto.notes,
                isPublic: dto.isPublic ?? false,
                createdById: userId,
                meetingSongs: dto.songs
                    ? {
                        createMany: {
                            data: dto.songs.map((s) => ({
                                songId: s.songId,
                                order: s.order,
                                keyOverride: s.keyOverride,
                                notes: s.notes,
                            })),
                        },
                    }
                    : undefined,
            },
            include: MEETING_INCLUDE,
        });
    }
    async findAll(churchId, upcoming = false) {
        return this.prisma.meeting.findMany({
            where: {
                churchId,
                ...(upcoming && { date: { gte: new Date() } }),
            },
            include: {
                _count: { select: { meetingSongs: true, assignments: true } },
            },
            orderBy: { date: upcoming ? "asc" : "desc" },
        });
    }
    async findOne(churchId, meetingId) {
        const meeting = await this.prisma.meeting.findFirst({
            where: { id: meetingId, churchId },
            include: MEETING_INCLUDE,
        });
        if (!meeting)
            throw new common_1.NotFoundException("Reunión no encontrada");
        return meeting;
    }
    async update(churchId, meetingId, dto) {
        await this.assertBelongsToChurch(meetingId, churchId);
        return this.prisma.meeting.update({
            where: { id: meetingId },
            data: {
                title: dto.title,
                date: dto.date ? new Date(dto.date) : undefined,
                notes: dto.notes,
                isPublic: dto.isPublic,
            },
            include: MEETING_INCLUDE,
        });
    }
    async remove(churchId, meetingId) {
        await this.assertBelongsToChurch(meetingId, churchId);
        return this.prisma.meeting.delete({ where: { id: meetingId } });
    }
    async addSong(churchId, meetingId, songId, keyOverride, notes) {
        await this.assertBelongsToChurch(meetingId, churchId);
        const count = await this.prisma.meetingSong.count({ where: { meetingId } });
        return this.prisma.meetingSong.create({
            data: { meetingId, songId, order: count + 1, keyOverride, notes },
            include: {
                song: { select: { id: true, title: true, originalKey: true } },
            },
        });
    }
    async reorderSongs(churchId, meetingId, orderedSongIds) {
        await this.assertBelongsToChurch(meetingId, churchId);
        await this.prisma.$transaction(orderedSongIds.map((songId, index) => this.prisma.meetingSong.updateMany({
            where: { meetingId, songId },
            data: { order: index + 1 },
        })));
        return this.findOne(churchId, meetingId);
    }
    async removeSong(churchId, meetingId, meetingSongId) {
        await this.assertBelongsToChurch(meetingId, churchId);
        return this.prisma.meetingSong.delete({ where: { id: meetingSongId } });
    }
    async assignMusician(meetingId, userId, instrumentId, notes) {
        return this.prisma.assignment.upsert({
            where: {
                meetingId_userId_instrumentId: { meetingId, userId, instrumentId },
            },
            create: { meetingId, userId, instrumentId, notes },
            update: { notes },
            include: {
                user: { select: { id: true, name: true } },
                instrument: { select: { id: true, name: true, icon: true } },
            },
        });
    }
    async unassignMusician(meetingId, assignmentId) {
        return this.prisma.assignment.delete({ where: { id: assignmentId } });
    }
    async generateShareLink(churchId, meetingId) {
        await this.assertBelongsToChurch(meetingId, churchId);
        const shareToken = (0, uuid_1.v4)();
        return this.prisma.meeting.update({
            where: { id: meetingId },
            data: { isPublic: true, shareToken },
            select: { shareToken: true },
        });
    }
    async findByShareToken(shareToken) {
        const meeting = await this.prisma.meeting.findUnique({
            where: { shareToken },
            include: MEETING_INCLUDE,
        });
        if (!meeting || !meeting.isPublic) {
            throw new common_1.NotFoundException("Reunión no disponible");
        }
        return meeting;
    }
    async assertBelongsToChurch(meetingId, churchId) {
        const m = await this.prisma.meeting.findFirst({
            where: { id: meetingId, churchId },
        });
        if (!m)
            throw new common_1.NotFoundException("Reunión no encontrada");
    }
};
exports.MeetingsService = MeetingsService;
exports.MeetingsService = MeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MeetingsService);
//# sourceMappingURL=meetings.service.js.map