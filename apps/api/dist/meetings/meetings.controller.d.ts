import { CreateMeetingDto } from "./dto/create-meeting.dto";
import { MeetingsService } from "./meetings.service";
export declare class MeetingsController {
    private readonly meetingsService;
    constructor(meetingsService: MeetingsService);
    create(churchId: string, userId: string, dto: CreateMeetingDto): Promise<{
        meetingSongs: ({
            song: {
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
            };
        } & {
            id: string;
            notes: string | null;
            songId: string;
            order: number;
            meetingId: string;
            keyOverride: string | null;
        })[];
        assignments: ({
            user: {
                id: string;
                name: string;
                avatarUrl: string | null;
            };
            instrument: {
                id: string;
                name: string;
                icon: string | null;
            };
        } & {
            id: string;
            notes: string | null;
            meetingId: string;
            userId: string;
            instrumentId: string;
        })[];
    } & {
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        createdById: string | null;
        notes: string | null;
        date: Date;
        isPublic: boolean;
        shareToken: string | null;
    }>;
    findAll(churchId: string, upcoming?: boolean): Promise<({
        _count: {
            meetingSongs: number;
            assignments: number;
        };
    } & {
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        createdById: string | null;
        notes: string | null;
        date: Date;
        isPublic: boolean;
        shareToken: string | null;
    })[]>;
    findOne(churchId: string, id: string): Promise<{
        meetingSongs: ({
            song: {
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
            };
        } & {
            id: string;
            notes: string | null;
            songId: string;
            order: number;
            meetingId: string;
            keyOverride: string | null;
        })[];
        assignments: ({
            user: {
                id: string;
                name: string;
                avatarUrl: string | null;
            };
            instrument: {
                id: string;
                name: string;
                icon: string | null;
            };
        } & {
            id: string;
            notes: string | null;
            meetingId: string;
            userId: string;
            instrumentId: string;
        })[];
    } & {
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        createdById: string | null;
        notes: string | null;
        date: Date;
        isPublic: boolean;
        shareToken: string | null;
    }>;
    update(churchId: string, id: string, dto: Partial<CreateMeetingDto>): Promise<{
        meetingSongs: ({
            song: {
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
            };
        } & {
            id: string;
            notes: string | null;
            songId: string;
            order: number;
            meetingId: string;
            keyOverride: string | null;
        })[];
        assignments: ({
            user: {
                id: string;
                name: string;
                avatarUrl: string | null;
            };
            instrument: {
                id: string;
                name: string;
                icon: string | null;
            };
        } & {
            id: string;
            notes: string | null;
            meetingId: string;
            userId: string;
            instrumentId: string;
        })[];
    } & {
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        createdById: string | null;
        notes: string | null;
        date: Date;
        isPublic: boolean;
        shareToken: string | null;
    }>;
    remove(churchId: string, id: string): Promise<{
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        createdById: string | null;
        notes: string | null;
        date: Date;
        isPublic: boolean;
        shareToken: string | null;
    }>;
    addSong(churchId: string, meetingId: string, songId: string, keyOverride?: string, notes?: string): Promise<{
        song: {
            id: string;
            title: string;
            originalKey: string;
        };
    } & {
        id: string;
        notes: string | null;
        songId: string;
        order: number;
        meetingId: string;
        keyOverride: string | null;
    }>;
    reorderSongs(churchId: string, meetingId: string, orderedSongIds: string[]): Promise<{
        meetingSongs: ({
            song: {
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
            };
        } & {
            id: string;
            notes: string | null;
            songId: string;
            order: number;
            meetingId: string;
            keyOverride: string | null;
        })[];
        assignments: ({
            user: {
                id: string;
                name: string;
                avatarUrl: string | null;
            };
            instrument: {
                id: string;
                name: string;
                icon: string | null;
            };
        } & {
            id: string;
            notes: string | null;
            meetingId: string;
            userId: string;
            instrumentId: string;
        })[];
    } & {
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        createdById: string | null;
        notes: string | null;
        date: Date;
        isPublic: boolean;
        shareToken: string | null;
    }>;
    removeSong(churchId: string, meetingId: string, meetingSongId: string): Promise<{
        id: string;
        notes: string | null;
        songId: string;
        order: number;
        meetingId: string;
        keyOverride: string | null;
    }>;
    assign(churchId: string, meetingId: string, userId: string, instrumentId: string, notes?: string): Promise<{
        user: {
            id: string;
            name: string;
        };
        instrument: {
            id: string;
            name: string;
            icon: string | null;
        };
    } & {
        id: string;
        notes: string | null;
        meetingId: string;
        userId: string;
        instrumentId: string;
    }>;
    unassign(churchId: string, meetingId: string, assignmentId: string): Promise<{
        id: string;
        notes: string | null;
        meetingId: string;
        userId: string;
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
        meetingSongs: ({
            song: {
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
            };
        } & {
            id: string;
            notes: string | null;
            songId: string;
            order: number;
            meetingId: string;
            keyOverride: string | null;
        })[];
        assignments: ({
            user: {
                id: string;
                name: string;
                avatarUrl: string | null;
            };
            instrument: {
                id: string;
                name: string;
                icon: string | null;
            };
        } & {
            id: string;
            notes: string | null;
            meetingId: string;
            userId: string;
            instrumentId: string;
        })[];
    } & {
        id: string;
        churchId: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        createdById: string | null;
        notes: string | null;
        date: Date;
        isPublic: boolean;
        shareToken: string | null;
    }>;
}
