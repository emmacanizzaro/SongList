import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { InstrumentsService } from './instruments.service';

@ApiTags('instruments')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar instrumentos de la iglesia' })
  findAll(@CurrentTenant() churchId: string) {
    return this.instrumentsService.findAll(churchId);
  }

  @Post()
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Crear instrumento personalizado' })
  create(
    @CurrentTenant() churchId: string,
    @Body('name') name: string,
    @Body('icon') icon?: string,
  ) {
    return this.instrumentsService.create(churchId, name, icon);
  }

  @Patch(':id')
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Editar instrumento' })
  update(
    @CurrentTenant() churchId: string,
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('icon') icon?: string,
  ) {
    return this.instrumentsService.update(churchId, id, name, icon);
  }

  @Delete(':id')
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar instrumento' })
  remove(@CurrentTenant() churchId: string, @Param('id') id: string) {
    return this.instrumentsService.remove(churchId, id);
  }

  @Patch('reorder')
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Reordenar instrumentos' })
  reorder(
    @CurrentTenant() churchId: string,
    @Body('orderedIds') orderedIds: string[],
  ) {
    return this.instrumentsService.reorder(churchId, orderedIds);
  }
}
