import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, VersionType } from '@prisma/client'
import { CreateSongDto } from '../domain/create-song.dto'
import { PrismaService } from '../prisma/prisma.service'
import { EntitlementsService } from '../subscriptions/entitlements.service'
import { TranspositionService } from '../transposition/transposition.service'

@Injectable()
export class SongsService {
  constructor(
    private prisma: PrismaService,
    private transposition: TranspositionService,
    private entitlements: EntitlementsService,
  ) {}

  async create(churchId: string, userId: string, dto: CreateSongDto) {
    await this.entitlements.assertCanAddSong(churchId)

    const song = await this.prisma.song.create({
      data: {
        churchId,
        title: dto.title,
        artist: dto.artist,
        originalKey: dto.originalKey,
        bpm: dto.bpm,
        tags: dto.tags ?? [],
        createdById: userId,
        versions: dto.version
          ? {
              create: {
                type: dto.version.type,
                key: dto.version.key,
                lyricsChords: dto.version.lyricsChords,
                notes: dto.version.notes,
              },
            }
          : undefined,
      },
      include: { versions: true },
    })

    return song
  }

  async findAll(churchId: string, search?: string, page = 1, pageSize = 20) {
    const where = {
      churchId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { artist: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { tags: { has: search.toLowerCase() } },
        ],
      }),
    }
    const [items, total] = await Promise.all([
      this.prisma.song.findMany({
        where,
        include: { _count: { select: { versions: true, meetingSongs: true } } },
        orderBy: { title: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.song.count({ where }),
    ])
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async findOne(churchId: string, songId: string) {
    const song = await this.prisma.song.findFirst({
      where: { id: songId, churchId },
      include: { versions: { orderBy: { createdAt: 'asc' } } },
    })
    if (!song) throw new NotFoundException('Canción no encontrada')
    return song
  }

  async update(churchId: string, songId: string, dto: Partial<CreateSongDto>) {
    await this.assertBelongsToChurch(songId, churchId)
    return this.prisma.song.update({
      where: { id: songId },
      data: {
        title: dto.title,
        artist: dto.artist,
        originalKey: dto.originalKey,
        bpm: dto.bpm,
        tags: dto.tags,
      },
    })
  }

  async remove(churchId: string, songId: string) {
    await this.assertBelongsToChurch(songId, churchId)
    return this.prisma.song.delete({ where: { id: songId } })
  }

  // ── Versiones ────────────────────────────────────────────

  async addVersion(
    churchId: string,
    songId: string,
    type: VersionType,
    targetKey: string,
    notes?: string,
  ) {
    const song = await this.findOne(churchId, songId)
    const originalVersion = song.versions.find((v) => v.type === 'ORIGINAL')

    if (!originalVersion) {
      throw new ForbiddenException(
        'La canción necesita una versión ORIGINAL antes de crear variantes',
      )
    }

    // Transposición automática
    const transposedLyrics = this.transposition.transposeLyrics(originalVersion.lyricsChords, {
      fromKey: originalVersion.key,
      toKey: targetKey,
    })

    return this.prisma.songVersion.upsert({
      where: { songId_type: { songId, type } },
      create: {
        songId,
        type,
        key: targetKey,
        lyricsChords: transposedLyrics,
        notes,
      },
      update: { key: targetKey, lyricsChords: transposedLyrics, notes },
    })
  }

  async getLiveTransposition(churchId: string, songId: string, targetKey: string) {
    const song = await this.findOne(churchId, songId)
    const original = song.versions.find((v) => v.type === VersionType.ORIGINAL)

    if (!original) {
      throw new NotFoundException('Esta canción no tiene letra/acordes cargados')
    }

    const transposed = this.transposition.transposeLyrics(original.lyricsChords, {
      fromKey: original.key,
      toKey: targetKey,
    })

    return {
      songId,
      originalKey: original.key,
      targetKey,
      lyricsChords: transposed,
      chords: this.transposition.extractChords(transposed),
    }
  }

  private async assertBelongsToChurch(songId: string, churchId: string) {
    const song = await this.prisma.song.findFirst({
      where: { id: songId, churchId },
    })
    if (!song) throw new NotFoundException('Canción no encontrada')
  }
}
