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
    findOne(churchId: string, id: string): Promise<{
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
    update(churchId: string, id: string, dto: Partial<CreateSongDto>): Promise<{
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
    remove(churchId: string, id: string): Promise<{
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
    liveTranspose(churchId: string, songId: string, targetKey: string): Promise<{
        songId: string;
        originalKey: string;
        targetKey: string;
        lyricsChords: string;
        chords: string[];
    }>;
}
