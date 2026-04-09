import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
export declare class MeetingsController {
    private readonly meetingsService;
    constructor(meetingsService: MeetingsService);
    create(churchId: string, userId: string, dto: CreateMeetingDto): Promise<{
        assignments: ({
            user: {
                name: string;
                id: string;
                avatarUrl: string | null;
            };
            instrument: {
                name: string;
                id: string;
                icon: string | null;
            };
        } & {
            id: string;
            userId: string;
            notes: string | null;
            meetingId: string;
            instrumentId: string;
        })[];
        meetingSongs: ({
            song: {
                versions: {
                    type: import(".prisma/client").$Enums.VersionType;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    notes: string | null;
                    songId: string;
                    key: string;
                    lyricsChords: string;
                }[];
            } & {
                title: string;
                id: string;
                churchId: string;
                createdAt: Date;
                updatedAt: Date;
                tags: string[];
                createdById: string | null;
                artist: string | null;
                originalKey: string;
                bpm: number | null;
            };
        } & {
            id: string;
            notes: string | null;
            songId: string;
            order: number;
            keyOverride: string | null;
            meetingId: string;
        })[];
    } & {
        title: string;
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
    }>;
    findAll(churchId: string, upcoming?: boolean): Promise<({
        _count: {
            assignments: number;
            meetingSongs: number;
        };
    } & {
        title: string;
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
    })[]>;
    findOne(churchId: string, id: string): Promise<{
        assignments: ({
            user: {
                name: string;
                id: string;
                avatarUrl: string | null;
            };
            instrument: {
                name: string;
                id: string;
                icon: string | null;
            };
        } & {
            id: string;
            userId: string;
            notes: string | null;
            meetingId: string;
            instrumentId: string;
        })[];
        meetingSongs: ({
            song: {
                versions: {
                    type: import(".prisma/client").$Enums.VersionType;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    notes: string | null;
                    songId: string;
                    key: string;
                    lyricsChords: string;
                }[];
            } & {
                title: string;
                id: string;
                churchId: string;
                createdAt: Date;
                updatedAt: Date;
                tags: string[];
                createdById: string | null;
                artist: string | null;
                originalKey: string;
                bpm: number | null;
            };
        } & {
            id: string;
            notes: string | null;
            songId: string;
            order: number;
            keyOverride: string | null;
            meetingId: string;
        })[];
    } & {
        title: string;
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
    }>;
    update(churchId: string, id: string, dto: Partial<CreateMeetingDto>): Promise<{
        assignments: ({
            user: {
                name: string;
                id: string;
                avatarUrl: string | null;
            };
            instrument: {
                name: string;
                id: string;
                icon: string | null;
            };
        } & {
            id: string;
            userId: string;
            notes: string | null;
            meetingId: string;
            instrumentId: string;
        })[];
        meetingSongs: ({
            song: {
                versions: {
                    type: import(".prisma/client").$Enums.VersionType;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    notes: string | null;
                    songId: string;
                    key: string;
                    lyricsChords: string;
                }[];
            } & {
                title: string;
                id: string;
                churchId: string;
                createdAt: Date;
                updatedAt: Date;
                tags: string[];
                createdById: string | null;
                artist: string | null;
                originalKey: string;
                bpm: number | null;
            };
        } & {
            id: string;
            notes: string | null;
            songId: string;
            order: number;
            keyOverride: string | null;
            meetingId: string;
        })[];
    } & {
        title: string;
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
    }>;
    remove(churchId: string, id: string): Promise<{
        title: string;
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
    }>;
    addSong(churchId: string, meetingId: string, songId: string, keyOverride?: string, notes?: string): Promise<{
        song: {
            title: string;
            id: string;
            originalKey: string;
        };
    } & {
        id: string;
        notes: string | null;
        songId: string;
        order: number;
        keyOverride: string | null;
        meetingId: string;
    }>;
    reorderSongs(churchId: string, meetingId: string, orderedSongIds: string[]): Promise<{
        assignments: ({
            user: {
                name: string;
                id: string;
                avatarUrl: string | null;
            };
            instrument: {
                name: string;
                id: string;
                icon: string | null;
            };
        } & {
            id: string;
            userId: string;
            notes: string | null;
            meetingId: string;
            instrumentId: string;
        })[];
        meetingSongs: ({
            song: {
                versions: {
                    type: import(".prisma/client").$Enums.VersionType;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    notes: string | null;
                    songId: string;
                    key: string;
                    lyricsChords: string;
                }[];
            } & {
                title: string;
                id: string;
                churchId: string;
                createdAt: Date;
                updatedAt: Date;
                tags: string[];
                createdById: string | null;
                artist: string | null;
                originalKey: string;
                bpm: number | null;
            };
        } & {
            id: string;
            notes: string | null;
            songId: string;
            order: number;
            keyOverride: string | null;
            meetingId: string;
        })[];
    } & {
        title: string;
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
    }>;
    removeSong(churchId: string, meetingId: string, meetingSongId: string): Promise<{
        id: string;
        notes: string | null;
        songId: string;
        order: number;
        keyOverride: string | null;
        meetingId: string;
    }>;
    assign(meetingId: string, userId: string, instrumentId: string, notes?: string): Promise<{
        user: {
            name: string;
            id: string;
        };
        instrument: {
            name: string;
            id: string;
            icon: string | null;
        };
    } & {
        id: string;
        userId: string;
        notes: string | null;
        meetingId: string;
        instrumentId: string;
    }>;
    unassign(meetingId: string, assignmentId: string): Promise<{
        id: string;
        userId: string;
        notes: string | null;
        meetingId: string;
        instrumentId: string;
    }>;
    generateShare(churchId: string, meetingId: string): Promise<{
        shareToken: string | null;
    }>;
}
export declare class PublicMeetingsController {
    private readonly meetingsService;
    constructor(meetingsService: MeetingsService);
    findByToken(token: string): Promise<{
        assignments: ({
            user: {
                name: string;
                id: string;
                avatarUrl: string | null;
            };
            instrument: {
                name: string;
                id: string;
                icon: string | null;
            };
        } & {
            id: string;
            userId: string;
            notes: string | null;
            meetingId: string;
            instrumentId: string;
        })[];
        meetingSongs: ({
            song: {
                versions: {
                    type: import(".prisma/client").$Enums.VersionType;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    notes: string | null;
                    songId: string;
                    key: string;
                    lyricsChords: string;
                }[];
            } & {
                title: string;
                id: string;
                churchId: string;
                createdAt: Date;
                updatedAt: Date;
                tags: string[];
                createdById: string | null;
                artist: string | null;
                originalKey: string;
                bpm: number | null;
            };
        } & {
            id: string;
            notes: string | null;
            songId: string;
            order: number;
            keyOverride: string | null;
            meetingId: string;
        })[];
    } & {
        title: string;
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
    }>;
}
