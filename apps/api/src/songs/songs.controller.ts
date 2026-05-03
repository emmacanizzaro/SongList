import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { MemberRole, VersionType } from '@prisma/client'
import { CreateSongDto } from '../domain/create-song.dto'
import { CurrentTenant } from '../utils/tenant.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { SongsService } from './songs.service'

@ApiTags('songs')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Crear canción' })
  create(
    @CurrentTenant() churchId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSongDto,
  ) {
    return this.songsService.create(churchId, userId, dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar canciones (con búsqueda y paginación)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  findAll(
    @CurrentTenant() churchId: string,
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ) {
    return this.songsService.findAll(
      churchId,
      search,
      parseInt(page, 10) || 1,
      parseInt(pageSize, 10) || 20,
    )
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener canción con todas las versiones' })
  findOne(@CurrentTenant() churchId: string, @Param('id') id: string) {
    return this.songsService.findOne(churchId, id)
  }

  @Patch(':id')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Editar canción' })
  update(
    @CurrentTenant() churchId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateSongDto>,
  ) {
    return this.songsService.update(churchId, id, dto)
  }

  @Delete(':id')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Eliminar canción' })
  remove(@CurrentTenant() churchId: string, @Param('id') id: string) {
    return this.songsService.remove(churchId, id)
  }

  // ── Versiones y transposición ────────────────────────────

  @Post(':id/versions')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({
    summary: 'Generar versión transpuesta (hombre/mujer/custom)',
  })
  addVersion(
    @CurrentTenant() churchId: string,
    @Param('id') songId: string,
    @Body('type') type: VersionType,
    @Body('targetKey') targetKey: string,
    @Body('notes') notes?: string,
  ) {
    return this.songsService.addVersion(churchId, songId, type, targetKey, notes)
  }

  @Get(':id/transpose')
  @ApiOperation({ summary: 'Transposición en vivo (sin guardar)' })
  @ApiQuery({
    name: 'key',
    required: true,
    description: 'Tonalidad destino: C, F#, Bb, etc.',
  })
  liveTranspose(
    @CurrentTenant() churchId: string,
    @Param('id') songId: string,
    @Query('key') targetKey: string,
  ) {
    return this.songsService.getLiveTransposition(churchId, songId, targetKey)
  }
}
