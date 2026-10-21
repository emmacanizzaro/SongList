import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AdminService } from './admin.service'
import { PlatformAdminGuard } from './platform-admin.guard'
import { UpdateSubscriptionDto } from './update-subscription.dto'

@ApiTags('admin')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('churches')
  @ApiOperation({ summary: 'Listar todas las iglesias con su plan (admin de plataforma)' })
  listChurches() {
    return this.adminService.listChurches()
  }

  @Patch('churches/:churchId/subscription')
  @ApiOperation({ summary: 'Cambiar plan y fechas de una iglesia (admin de plataforma)' })
  updateSubscription(@Param('churchId') churchId: string, @Body() dto: UpdateSubscriptionDto) {
    return this.adminService.updateSubscription(churchId, dto)
  }
}
