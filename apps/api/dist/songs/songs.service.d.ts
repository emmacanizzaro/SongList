import { VersionType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { TranspositionService } from "../transposition/transposition.service";
import { CreateSongDto } from "./dto/create-song.dto";
export declare class SongsService {
    private prisma;
    private transposition;
    private subscriptions;
    constructor(prisma: PrismaService, transposition: TranspositionService, subscriptions: SubscriptionsService);
    create(churchId: string, userId: string, dto: CreateSongDto): Promise<{
        versions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.VersionType;
            notes: string | null;
            songId: string;
            key: string;
            lyricsChords: string;
        }[];
    } & {
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        title: string;
        createdById: string | null;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
    }>;
    findAll(churchId: string, search?: string): Promise<({
        _count: {
            meetingSongs: number;
            versions: number;
        };
    } & {
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        title: string;
        createdById: string | null;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
    })[]>;
    findOne(churchId: string, songId: string): Promise<{
        versions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.VersionType;
            notes: string | null;
            songId: string;
            key: string;
            lyricsChords: string;
        }[];
    } & {
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        title: string;
        createdById: string | null;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
    }>;
    update(churchId: string, songId: string, dto: Partial<CreateSongDto>): Promise<{
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        title: string;
        createdById: string | null;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
    }>;
    remove(churchId: string, songId: string): Promise<{
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        title: string;
        createdById: string | null;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
    }>;
    addVersion(churchId: string, songId: string, type: VersionType, targetKey: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.VersionType;
        notes: string | null;
        songId: string;
        key: string;
        lyricsChords: string;
    }>;
    getLiveTransposition(churchId: string, songId: string, targetKey: string): Promise<{
        songId: string;
        originalKey: string;
        targetKey: string;
        lyricsChords: string;
        chords: string[];
    }>;
    private assertBelongsToChurch;
}
