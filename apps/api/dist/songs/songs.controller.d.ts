import { VersionType } from '@prisma/client';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
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
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
        tags: string[];
        createdById: string | null;
    }>;
    findAll(churchId: string, search?: string): Promise<({
        _count: {
            versions: number;
            meetingSongs: number;
        };
    } & {
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
        tags: string[];
        createdById: string | null;
    })[]>;
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
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
        tags: string[];
        createdById: string | null;
    }>;
    update(churchId: string, id: string, dto: Partial<CreateSongDto>): Promise<{
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
        tags: string[];
        createdById: string | null;
    }>;
    remove(churchId: string, id: string): Promise<{
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string | null;
        originalKey: string;
        bpm: number | null;
        tags: string[];
        createdById: string | null;
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
