import { PrismaService } from "../prisma/prisma.service";
import { EntitlementsService } from "../subscriptions/entitlements.service";
import { CreateMeetingDto } from "./dto/create-meeting.dto";
export declare class MeetingsService {
    private prisma;
    private entitlements;
    constructor(prisma: PrismaService, entitlements: EntitlementsService);
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
    findOne(churchId: string, meetingId: string): Promise<{
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
    update(churchId: string, meetingId: string, dto: Partial<CreateMeetingDto>): Promise<{
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
    remove(churchId: string, meetingId: string): Promise<{
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
    assignMusician(churchId: string, meetingId: string, userId: string, instrumentId: string, notes?: string): Promise<{
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
    unassignMusician(churchId: string, meetingId: string, assignmentId: string): Promise<{
        id: string;
        notes: string | null;
        meetingId: string;
        userId: string;
        instrumentId: string;
    }>;
    generateShareLink(churchId: string, meetingId: string): Promise<{
        shareToken: string | null;
    }>;
    findByShareToken(shareToken: string): Promise<{
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
    private assertBelongsToChurch;
    private assertAssignmentBelongsToMeeting;
}
