import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { MemberRole } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CurrentTenant } from "../common/decorators/tenant.decorator";
import { ChurchesService } from "./churches.service";
import { CreateChurchDto } from "./dto/create-church.dto";

@ApiTags("churches")
@ApiBearerAuth("JWT")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("churches")
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @Get("me")
  @ApiOperation({ summary: "Obtener iglesia actual del usuario" })
  getMyChurch(@CurrentTenant() churchId: string) {
    return this.churchesService.findById(churchId);
  }

  @Patch("me")
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: "Actualizar datos de la iglesia (solo ADMIN)" })
  update(@CurrentTenant() churchId: string, @Body() dto: CreateChurchDto) {
    return this.churchesService.update(churchId, dto);
  }

  @Get("me/stats")
  @ApiOperation({ summary: "Dashboard stats de la iglesia" })
  getStats(@CurrentTenant() churchId: string) {
    return this.churchesService.getDashboardStats(churchId);
  }

  @Get("me/members")
  @ApiOperation({ summary: "Listar miembros de la iglesia" })
  getMembers(@CurrentTenant() churchId: string) {
    return this.churchesService.getMembers(churchId);
  }

  @Post("me/members")
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: "Invitar miembro (solo ADMIN)" })
  inviteMember(
    @CurrentTenant() churchId: string,
    @CurrentUser("currentRole") role: MemberRole,
    @Body("email") email: string,
    @Body("role") memberRole: MemberRole,
  ) {
    return this.churchesService.inviteMember(churchId, email, memberRole, role);
  }

  @Post("me/invites")
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: "Generar enlace de invitación (solo ADMIN)" })
  createInviteLink(
    @CurrentTenant() churchId: string,
    @CurrentUser("id") invitedByUserId: string,
    @CurrentUser("currentRole") role: MemberRole,
    @Body("email") email: string,
    @Body("role") memberRole: MemberRole,
  ) {
    return this.churchesService.createInviteLink(
      churchId,
      invitedByUserId,
      email,
      memberRole,
      role,
    );
  }

  @Patch("me/members/:memberId/role")
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: "Cambiar rol de un miembro (solo ADMIN)" })
  updateRole(
    @CurrentTenant() churchId: string,
    @Param("memberId") memberId: string,
    @Body("role") role: MemberRole,
  ) {
    return this.churchesService.updateMemberRole(churchId, memberId, role);
  }

  @Delete("me/members/:memberId")
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: "Eliminar miembro (solo ADMIN)" })
  removeMember(
    @CurrentTenant() churchId: string,
    @CurrentUser("id") userId: string,
    @Param("memberId") memberId: string,
  ) {
    return this.churchesService.removeMember(churchId, memberId, userId);
  }
}

@ApiTags("churches")
@Controller("churches/invites")
export class PublicChurchInvitesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @Get(":token/public")
  @ApiOperation({ summary: "Consultar invitación por token (público)" })
  getInviteByToken(@Param("token") token: string) {
    return this.churchesService.getInviteByToken(token);
  }
}
