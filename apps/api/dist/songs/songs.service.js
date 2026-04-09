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
exports.SongsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
const transposition_service_1 = require("../transposition/transposition.service");
let SongsService = class SongsService {
    constructor(prisma, transposition, subscriptions) {
        this.prisma = prisma;
        this.transposition = transposition;
        this.subscriptions = subscriptions;
    }
    async create(churchId, userId, dto) {
        const limits = await this.subscriptions.getLimits(churchId);
        if (limits.maxSongs !== -1) {
            const count = await this.prisma.song.count({ where: { churchId } });
            if (count >= limits.maxSongs) {
                throw new common_1.ForbiddenException(`Tu plan permite un máximo de ${limits.maxSongs} canciones. Actualiza tu plan para agregar más.`);
            }
        }
        const song = await this.prisma.song.create({
            data: {
                churchId,
                title: dto.title,
                artist: dto.artist,
                originalKey: dto.originalKey,
                bpm: dto.bpm,
                tags: dto.tags ?? [],
                createdById: userId,
                versions: dto.version
                    ? {
                        create: {
                            type: dto.version.type,
                            key: dto.version.key,
                            lyricsChords: dto.version.lyricsChords,
                            notes: dto.version.notes,
                        },
                    }
                    : undefined,
            },
            include: { versions: true },
        });
        return song;
    }
    async findAll(churchId, search) {
        return this.prisma.song.findMany({
            where: {
                churchId,
                ...(search && {
                    OR: [
                        { title: { contains: search, mode: "insensitive" } },
                        { artist: { contains: search, mode: "insensitive" } },
                        { tags: { has: search.toLowerCase() } },
                    ],
                }),
            },
            include: { _count: { select: { versions: true, meetingSongs: true } } },
            orderBy: { title: "asc" },
        });
    }
    async findOne(churchId, songId) {
        const song = await this.prisma.song.findFirst({
            where: { id: songId, churchId },
            include: { versions: { orderBy: { createdAt: "asc" } } },
        });
        if (!song)
            throw new common_1.NotFoundException("Canción no encontrada");
        return song;
    }
    async update(churchId, songId, dto) {
        await this.assertBelongsToChurch(songId, churchId);
        return this.prisma.song.update({
            where: { id: songId },
            data: {
                title: dto.title,
                artist: dto.artist,
                originalKey: dto.originalKey,
                bpm: dto.bpm,
                tags: dto.tags,
            },
        });
    }
    async remove(churchId, songId) {
        await this.assertBelongsToChurch(songId, churchId);
        return this.prisma.song.delete({ where: { id: songId } });
    }
    async addVersion(churchId, songId, type, targetKey, notes) {
        const song = await this.findOne(churchId, songId);
        const originalVersion = song.versions.find((v) => v.type === "ORIGINAL");
        if (!originalVersion) {
            throw new common_1.ForbiddenException("La canción necesita una versión ORIGINAL antes de crear variantes");
        }
        const transposedLyrics = this.transposition.transposeLyrics(originalVersion.lyricsChords, { fromKey: originalVersion.key, toKey: targetKey });
        return this.prisma.songVersion.upsert({
            where: { songId_type: { songId, type } },
            create: {
                songId,
                type,
                key: targetKey,
                lyricsChords: transposedLyrics,
                notes,
            },
            update: { key: targetKey, lyricsChords: transposedLyrics, notes },
        });
    }
    async getLiveTransposition(churchId, songId, targetKey) {
        const song = await this.findOne(churchId, songId);
        const original = song.versions.find((v) => v.type === client_1.VersionType.ORIGINAL);
        if (!original) {
            throw new common_1.NotFoundException("Esta canción no tiene letra/acordes cargados");
        }
        const transposed = this.transposition.transposeLyrics(original.lyricsChords, {
            fromKey: original.key,
            toKey: targetKey,
        });
        return {
            songId,
            originalKey: original.key,
            targetKey,
            lyricsChords: transposed,
            chords: this.transposition.extractChords(transposed),
        };
    }
    async assertBelongsToChurch(songId, churchId) {
        const song = await this.prisma.song.findFirst({
            where: { id: songId, churchId },
        });
        if (!song)
            throw new common_1.NotFoundException("Canción no encontrada");
    }
};
exports.SongsService = SongsService;
exports.SongsService = SongsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transposition_service_1.TranspositionService,
        subscriptions_service_1.SubscriptionsService])
], SongsService);
//# sourceMappingURL=songs.service.js.map