import { VersionType } from '@prisma/client';
import { CreateSongDto } from '../domain/create-song.dto';
import { SongsService } from './songs.service';
export declare class SongsController {
    private readonly songsService;
    constructor(songsService: SongsService);
    create(churchId: string, userId: string, dto: CreateSongDto): Promise<{
        versions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.VersionType;
            key: string;
            lyricsChords: string;
            notes: string | null;
            songId: string;
        }[];
    } & {
        id: string;
        title: string;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
        tags: string[];
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        churchId: string;
    }>;
    findAll(churchId: string, search?: string, page?: string, pageSize?: string): Promise<{
        items: ({
            _count: {
                versions: number;
                meetingSongs: number;
            };
        } & {
            id: string;
            title: string;
            artist: string | null;
            originalKey: string;
            bpm: number | null;
            tags: string[];
            createdById: string | null;
            createdAt: Date;
            updatedAt: Date;
            churchId: string;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(churchId: string, id: string): Promise<{
        versions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.VersionType;
            key: string;
            lyricsChords: string;
            notes: string | null;
            songId: string;
        }[];
    } & {
        id: string;
        title: string;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
        tags: string[];
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        churchId: string;
    }>;
    update(churchId: string, id: string, dto: Partial<CreateSongDto>): Promise<{
        id: string;
        title: string;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
        tags: string[];
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        churchId: string;
    }>;
    remove(churchId: string, id: string): Promise<{
        id: string;
        title: string;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
        tags: string[];
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        churchId: string;
    }>;
    addVersion(churchId: string, songId: string, type: VersionType, targetKey: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.VersionType;
        key: string;
        lyricsChords: string;
        notes: string | null;
        songId: string;
    }>;
    liveTranspose(churchId: string, songId: string, targetKey: string): Promise<{
        songId: string;
        originalKey: string;
        targetKey: string;
        lyricsChords: string;
        chords: string[];
    }>;
}
