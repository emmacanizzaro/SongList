import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@ApiTags('meetings')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Crear reunión' })
  create(
    @CurrentTenant() churchId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMeetingDto,
  ) {
    return this.meetingsService.create(churchId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar reuniones' })
  @ApiQuery({ name: 'upcoming', required: false, type: Boolean })
  findAll(
    @CurrentTenant() churchId: string,
    @Query('upcoming') upcoming?: boolean,
  ) {
    return this.meetingsService.findAll(churchId, upcoming);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener reunión con canciones y asignaciones' })
  findOne(@CurrentTenant() churchId: string, @Param('id') id: string) {
    return this.meetingsService.findOne(churchId, id);
  }

  @Patch(':id')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Editar reunión' })
  update(
    @CurrentTenant() churchId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateMeetingDto>,
  ) {
    return this.meetingsService.update(churchId, id, dto);
  }

  @Delete(':id')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Eliminar reunión' })
  remove(@CurrentTenant() churchId: string, @Param('id') id: string) {
    return this.meetingsService.remove(churchId, id);
  }

  // ── Canciones de reunión ────────────────────────────────

  @Post(':id/songs')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Agregar canción a la reunión' })
  addSong(
    @CurrentTenant() churchId: string,
    @Param('id') meetingId: string,
    @Body('songId') songId: string,
    @Body('keyOverride') keyOverride?: string,
    @Body('notes') notes?: string,
  ) {
    return this.meetingsService.addSong(churchId, meetingId, songId, keyOverride, notes);
  }

  @Patch(':id/songs/reorder')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Reordenar canciones de la reunión' })
  reorderSongs(
    @CurrentTenant() churchId: string,
    @Param('id') meetingId: string,
    @Body('orderedSongIds') orderedSongIds: string[],
  ) {
    return this.meetingsService.reorderSongs(churchId, meetingId, orderedSongIds);
  }

  @Delete(':id/songs/:meetingSongId')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Quitar canción de la reunión' })
  removeSong(
    @CurrentTenant() churchId: string,
    @Param('id') meetingId: string,
    @Param('meetingSongId') meetingSongId: string,
  ) {
    return this.meetingsService.removeSong(churchId, meetingId, meetingSongId);
  }

  // ── Asignaciones ─────────────────────────────────────────

  @Post(':id/assignments')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Asignar músico a la reunión' })
  assign(
    @Param('id') meetingId: string,
    @Body('userId') userId: string,
    @Body('instrumentId') instrumentId: string,
    @Body('notes') notes?: string,
  ) {
    return this.meetingsService.assignMusician(meetingId, userId, instrumentId, notes);
  }

  @Delete(':id/assignments/:assignmentId')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Eliminar asignación' })
  unassign(
    @Param('id') meetingId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.meetingsService.unassignMusician(meetingId, assignmentId);
  }

  // ── Link público ─────────────────────────────────────────

  @Post(':id/share')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Generar link público de solo lectura' })
  generateShare(@CurrentTenant() churchId: string, @Param('id') meetingId: string) {
    return this.meetingsService.generateShareLink(churchId, meetingId);
  }
}

// ── Endpoint público (sin auth) para ver reunión compartida ──
import { Controller as PublicController } from '@nestjs/common';

@ApiTags('meetings')
@PublicController('public/meetings')
export class PublicMeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Ver reunión compartida (sin autenticación)' })
  findByToken(@Param('token') token: string) {
    return this.meetingsService.findByShareToken(token);
  }
}
