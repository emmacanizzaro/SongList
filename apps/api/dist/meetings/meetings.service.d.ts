import { PrismaService } from "../prisma/prisma.service";
import { EntitlementsService } from "../subscriptions/entitlements.service";
import { CreateMeetingDto } from "./dto/create-meeting.dto";
export declare class MeetingsService {
  private prisma;
  private entitlements;
  constructor(prisma: PrismaService, entitlements: EntitlementsService);
  create(
    churchId: string,
    userId: string,
    dto: CreateMeetingDto,
  ): Promise<
    {
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
          createdAt: Date;
          updatedAt: Date;
          churchId: string;
          tags: string[];
          createdById: string | null;
          artist: string | null;
          originalKey: string;
          bpm: number | null;
        };
      } & {
        id: string;
        notes: string | null;
        meetingId: string;
        songId: string;
        order: number;
        keyOverride: string | null;
      })[];
    } & {
      title: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      churchId: string;
      date: Date;
      notes: string | null;
      isPublic: boolean;
      shareToken: string | null;
      createdById: string | null;
    }
  >;
  findAll(
    churchId: string,
    upcoming?: boolean,
  ): Promise<
    ({
      _count: {
        assignments: number;
        meetingSongs: number;
      };
    } & {
      title: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      churchId: string;
      date: Date;
      notes: string | null;
      isPublic: boolean;
      shareToken: string | null;
      createdById: string | null;
    })[]
  >;
  findOne(
    churchId: string,
    meetingId: string,
  ): Promise<
    {
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
          createdAt: Date;
          updatedAt: Date;
          churchId: string;
          tags: string[];
          createdById: string | null;
          artist: string | null;
          originalKey: string;
          bpm: number | null;
        };
      } & {
        id: string;
        notes: string | null;
        meetingId: string;
        songId: string;
        order: number;
        keyOverride: string | null;
      })[];
    } & {
      title: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      churchId: string;
      date: Date;
      notes: string | null;
      isPublic: boolean;
      shareToken: string | null;
      createdById: string | null;
    }
  >;
  update(
    churchId: string,
    meetingId: string,
    dto: Partial<CreateMeetingDto>,
  ): Promise<
    {
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
          createdAt: Date;
          updatedAt: Date;
          churchId: string;
          tags: string[];
          createdById: string | null;
          artist: string | null;
          originalKey: string;
          bpm: number | null;
        };
      } & {
        id: string;
        notes: string | null;
        meetingId: string;
        songId: string;
        order: number;
        keyOverride: string | null;
      })[];
    } & {
      title: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      churchId: string;
      date: Date;
      notes: string | null;
      isPublic: boolean;
      shareToken: string | null;
      createdById: string | null;
    }
  >;
  remove(
    churchId: string,
    meetingId: string,
  ): Promise<{
    title: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    churchId: string;
    date: Date;
    notes: string | null;
    isPublic: boolean;
    shareToken: string | null;
    createdById: string | null;
  }>;
  addSong(
    churchId: string,
    meetingId: string,
    songId: string,
    keyOverride?: string,
    notes?: string,
  ): Promise<
    {
      song: {
        title: string;
        id: string;
        originalKey: string;
      };
    } & {
      id: string;
      notes: string | null;
      meetingId: string;
      songId: string;
      order: number;
      keyOverride: string | null;
    }
  >;
  reorderSongs(
    churchId: string,
    meetingId: string,
    orderedSongIds: string[],
  ): Promise<
    {
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
          createdAt: Date;
          updatedAt: Date;
          churchId: string;
          tags: string[];
          createdById: string | null;
          artist: string | null;
          originalKey: string;
          bpm: number | null;
        };
      } & {
        id: string;
        notes: string | null;
        meetingId: string;
        songId: string;
        order: number;
        keyOverride: string | null;
      })[];
    } & {
      title: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      churchId: string;
      date: Date;
      notes: string | null;
      isPublic: boolean;
      shareToken: string | null;
      createdById: string | null;
    }
  >;
  removeSong(
    churchId: string,
    meetingId: string,
    meetingSongId: string,
  ): Promise<{
    id: string;
    notes: string | null;
    meetingId: string;
    songId: string;
    order: number;
    keyOverride: string | null;
  }>;
  assignMusician(
    churchId: string,
    meetingId: string,
    userId: string,
    instrumentId: string,
    notes?: string,
  ): Promise<
    {
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
    }
  >;
  unassignMusician(
    churchId: string,
    meetingId: string,
    assignmentId: string,
  ): Promise<{
    id: string;
    userId: string;
    notes: string | null;
    meetingId: string;
    instrumentId: string;
  }>;
  generateShareLink(
    churchId: string,
    meetingId: string,
  ): Promise<{
    shareToken: string | null;
  }>;
  findByShareToken(shareToken: string): Promise<
    {
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
          createdAt: Date;
          updatedAt: Date;
          churchId: string;
          tags: string[];
          createdById: string | null;
          artist: string | null;
          originalKey: string;
          bpm: number | null;
        };
      } & {
        id: string;
        notes: string | null;
        meetingId: string;
        songId: string;
        order: number;
        keyOverride: string | null;
      })[];
    } & {
      title: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      churchId: string;
      date: Date;
      notes: string | null;
      isPublic: boolean;
      shareToken: string | null;
      createdById: string | null;
    }
  >;
  private assertBelongsToChurch;
  private assertAssignmentBelongsToMeeting;
}
