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
                    notes: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    type: import(".prisma/client").$Enums.VersionType;
                    songId: string;
                    key: string;
                    lyricsChords: string;
                }[];
            } & {
                id: string;
                title: string;
                createdById: string | null;
                createdAt: Date;
                updatedAt: Date;
                churchId: string;
                artist: string | null;
                originalKey: string;
                bpm: number | null;
                tags: string[];
            };
        } & {
            id: string;
            notes: string | null;
            order: number;
            meetingId: string;
            songId: string;
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
        title: string;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        churchId: string;
    }>;
    findAll(churchId: string, upcoming?: boolean): Promise<({
        _count: {
            meetingSongs: number;
            assignments: number;
        };
    } & {
        id: string;
        title: string;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        churchId: string;
    })[]>;
    findOne(churchId: string, id: string): Promise<{
        meetingSongs: ({
            song: {
                versions: {
                    id: string;
                    notes: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    type: import(".prisma/client").$Enums.VersionType;
                    songId: string;
                    key: string;
                    lyricsChords: string;
                }[];
            } & {
                id: string;
                title: string;
                createdById: string | null;
                createdAt: Date;
                updatedAt: Date;
                churchId: string;
                artist: string | null;
                originalKey: string;
                bpm: number | null;
                tags: string[];
            };
        } & {
            id: string;
            notes: string | null;
            order: number;
            meetingId: string;
            songId: string;
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
        title: string;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        churchId: string;
    }>;
    update(churchId: string, id: string, dto: Partial<CreateMeetingDto>): Promise<{
        meetingSongs: ({
            song: {
                versions: {
                    id: string;
                    notes: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    type: import(".prisma/client").$Enums.VersionType;
                    songId: string;
                    key: string;
                    lyricsChords: string;
                }[];
            } & {
                id: string;
                title: string;
                createdById: string | null;
                createdAt: Date;
                updatedAt: Date;
                churchId: string;
                artist: string | null;
                originalKey: string;
                bpm: number | null;
                tags: string[];
            };
        } & {
            id: string;
            notes: string | null;
            order: number;
            meetingId: string;
            songId: string;
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
        title: string;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        churchId: string;
    }>;
    remove(churchId: string, id: string): Promise<{
        id: string;
        title: string;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        churchId: string;
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
        order: number;
        meetingId: string;
        songId: string;
        keyOverride: string | null;
    }>;
    reorderSongs(churchId: string, meetingId: string, orderedSongIds: string[]): Promise<{
        meetingSongs: ({
            song: {
                versions: {
                    id: string;
                    notes: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    type: import(".prisma/client").$Enums.VersionType;
                    songId: string;
                    key: string;
                    lyricsChords: string;
                }[];
            } & {
                id: string;
                title: string;
                createdById: string | null;
                createdAt: Date;
                updatedAt: Date;
                churchId: string;
                artist: string | null;
                originalKey: string;
                bpm: number | null;
                tags: string[];
            };
        } & {
            id: string;
            notes: string | null;
            order: number;
            meetingId: string;
            songId: string;
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
        title: string;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        churchId: string;
    }>;
    removeSong(churchId: string, meetingId: string, meetingSongId: string): Promise<{
        id: string;
        notes: string | null;
        order: number;
        meetingId: string;
        songId: string;
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
                    notes: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    type: import(".prisma/client").$Enums.VersionType;
                    songId: string;
                    key: string;
                    lyricsChords: string;
                }[];
            } & {
                id: string;
                title: string;
                createdById: string | null;
                createdAt: Date;
                updatedAt: Date;
                churchId: string;
                artist: string | null;
                originalKey: string;
                bpm: number | null;
                tags: string[];
            };
        } & {
            id: string;
            notes: string | null;
            order: number;
            meetingId: string;
            songId: string;
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
        title: string;
        date: Date;
        notes: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdById: string | null;
        createdAt: Date;
        updatedAt: Date;
        churchId: string;
    }>;
}
