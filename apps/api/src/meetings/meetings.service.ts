import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, VersionType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMeetingDto } from "./dto/create-meeting.dto";

const MEETING_INCLUDE = Prisma.validator<Prisma.MeetingInclude>()({
  meetingSongs: {
    include: {
      song: {
        include: {
          versions: { where: { type: VersionType.ORIGINAL } },
        },
      },
    },
    orderBy: { order: "asc" as const },
  },
  assignments: {
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      instrument: { select: { id: true, name: true, icon: true } },
    },
  },
});

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  async create(churchId: string, userId: string, dto: CreateMeetingDto) {
    return this.prisma.meeting.create({
      data: {
        churchId,
        title: dto.title,
        date: new Date(dto.date),
        notes: dto.notes,
        isPublic: dto.isPublic ?? false,
        createdById: userId,
        meetingSongs: dto.songs
          ? {
              createMany: {
                data: dto.songs.map((s) => ({
                  songId: s.songId,
                  order: s.order,
                  keyOverride: s.keyOverride,
                  notes: s.notes,
                })),
              },
            }
          : undefined,
      },
      include: MEETING_INCLUDE,
    });
  }

  async findAll(churchId: string, upcoming = false) {
    return this.prisma.meeting.findMany({
      where: {
        churchId,
        ...(upcoming && { date: { gte: new Date() } }),
      },
      include: {
        _count: { select: { meetingSongs: true, assignments: true } },
      },
      orderBy: { date: upcoming ? "asc" : "desc" },
    });
  }

  async findOne(churchId: string, meetingId: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: { id: meetingId, churchId },
      include: MEETING_INCLUDE,
    });
    if (!meeting) throw new NotFoundException("Reunión no encontrada");
    return meeting;
  }

  async update(
    churchId: string,
    meetingId: string,
    dto: Partial<CreateMeetingDto>,
  ) {
    await this.assertBelongsToChurch(meetingId, churchId);
    return this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        title: dto.title,
        date: dto.date ? new Date(dto.date) : undefined,
        notes: dto.notes,
        isPublic: dto.isPublic,
      },
      include: MEETING_INCLUDE,
    });
  }

  async remove(churchId: string, meetingId: string) {
    await this.assertBelongsToChurch(meetingId, churchId);
    return this.prisma.meeting.delete({ where: { id: meetingId } });
  }

  // ── Canciones de reunión ────────────────────────────────

  async addSong(
    churchId: string,
    meetingId: string,
    songId: string,
    keyOverride?: string,
    notes?: string,
  ) {
    await this.assertBelongsToChurch(meetingId, churchId);

    const count = await this.prisma.meetingSong.count({ where: { meetingId } });

    return this.prisma.meetingSong.create({
      data: { meetingId, songId, order: count + 1, keyOverride, notes },
      include: {
        song: { select: { id: true, title: true, originalKey: true } },
      },
    });
  }

  async reorderSongs(
    churchId: string,
    meetingId: string,
    orderedSongIds: string[],
  ) {
    await this.assertBelongsToChurch(meetingId, churchId);

    await this.prisma.$transaction(
      orderedSongIds.map((songId, index) =>
        this.prisma.meetingSong.updateMany({
          where: { meetingId, songId },
          data: { order: index + 1 },
        }),
      ),
    );

    return this.findOne(churchId, meetingId);
  }

  async removeSong(churchId: string, meetingId: string, meetingSongId: string) {
    await this.assertBelongsToChurch(meetingId, churchId);
    return this.prisma.meetingSong.delete({ where: { id: meetingSongId } });
  }

  // ── Asignaciones ─────────────────────────────────────────

  async assignMusician(
    meetingId: string,
    userId: string,
    instrumentId: string,
    notes?: string,
  ) {
    return this.prisma.assignment.upsert({
      where: {
        meetingId_userId_instrumentId: { meetingId, userId, instrumentId },
      },
      create: { meetingId, userId, instrumentId, notes },
      update: { notes },
      include: {
        user: { select: { id: true, name: true } },
        instrument: { select: { id: true, name: true, icon: true } },
      },
    });
  }

  async unassignMusician(meetingId: string, assignmentId: string) {
    return this.prisma.assignment.delete({ where: { id: assignmentId } });
  }

  // ── Compartir reunión (link público) ─────────────────────

  async generateShareLink(churchId: string, meetingId: string) {
    await this.assertBelongsToChurch(meetingId, churchId);
    const shareToken = uuidv4();

    return this.prisma.meeting.update({
      where: { id: meetingId },
      data: { isPublic: true, shareToken },
      select: { shareToken: true },
    });
  }

  async findByShareToken(shareToken: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { shareToken },
      include: MEETING_INCLUDE,
    });
    if (!meeting || !meeting.isPublic) {
      throw new NotFoundException("Reunión no disponible");
    }
    return meeting;
  }

  private async assertBelongsToChurch(meetingId: string, churchId: string) {
    const m = await this.prisma.meeting.findFirst({
      where: { id: meetingId, churchId },
    });
    if (!m) throw new NotFoundException("Reunión no encontrada");
  }
}
