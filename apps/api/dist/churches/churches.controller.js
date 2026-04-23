"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicChurchInvitesController = exports.ChurchesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const churches_service_1 = require("./churches.service");
const create_church_dto_1 = require("./dto/create-church.dto");
let ChurchesController = class ChurchesController {
    constructor(churchesService) {
        this.churchesService = churchesService;
    }
    getMyChurch(churchId) {
        return this.churchesService.findById(churchId);
    }
    update(churchId, dto) {
        return this.churchesService.update(churchId, dto);
    }
    getStats(churchId) {
        return this.churchesService.getDashboardStats(churchId);
    }
    getMembers(churchId) {
        return this.churchesService.getMembers(churchId);
    }
    inviteMember(churchId, role, email, memberRole) {
        return this.churchesService.inviteMember(churchId, email, memberRole, role);
    }
    createInviteLink(churchId, invitedByUserId, role, email, memberRole) {
        return this.churchesService.createInviteLink(churchId, invitedByUserId, email, memberRole, role);
    }
    updateRole(churchId, memberId, role) {
        return this.churchesService.updateMemberRole(churchId, memberId, role);
    }
    removeMember(churchId, userId, memberId) {
        return this.churchesService.removeMember(churchId, memberId, userId);
    }
};
exports.ChurchesController = ChurchesController;
__decorate([
    (0, common_1.Get)("me"),
    (0, swagger_1.ApiOperation)({ summary: "Obtener iglesia actual del usuario" }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChurchesController.prototype, "getMyChurch", null);
__decorate([
    (0, common_1.Patch)("me"),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Actualizar datos de la iglesia (solo ADMIN)" }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_church_dto_1.CreateChurchDto]),
    __metadata("design:returntype", void 0)
], ChurchesController.prototype, "update", null);
__decorate([
    (0, common_1.Get)("me/stats"),
    (0, swagger_1.ApiOperation)({ summary: "Dashboard stats de la iglesia" }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChurchesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)("me/members"),
    (0, swagger_1.ApiOperation)({ summary: "Listar miembros de la iglesia" }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChurchesController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Post)("me/members"),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Invitar miembro (solo ADMIN)" }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)("currentRole")),
    __param(2, (0, common_1.Body)("email")),
    __param(3, (0, common_1.Body)("role")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ChurchesController.prototype, "inviteMember", null);
__decorate([
    (0, common_1.Post)("me/invites"),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Generar enlace de invitación (solo ADMIN)" }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)("id")),
    __param(2, (0, current_user_decorator_1.CurrentUser)("currentRole")),
    __param(3, (0, common_1.Body)("email")),
    __param(4, (0, common_1.Body)("role")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ChurchesController.prototype, "createInviteLink", null);
__decorate([
    (0, common_1.Patch)("me/members/:memberId/role"),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Cambiar rol de un miembro (solo ADMIN)" }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)("memberId")),
    __param(2, (0, common_1.Body)("role")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ChurchesController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)("me/members/:memberId"),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Eliminar miembro (solo ADMIN)" }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)("id")),
    __param(2, (0, common_1.Param)("memberId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ChurchesController.prototype, "removeMember", null);
exports.ChurchesController = ChurchesController = __decorate([
    (0, swagger_1.ApiTags)("churches"),
    (0, swagger_1.ApiBearerAuth)("JWT"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)("churches"),
    __metadata("design:paramtypes", [churches_service_1.ChurchesService])
], ChurchesController);
let PublicChurchInvitesController = class PublicChurchInvitesController {
    constructor(churchesService) {
        this.churchesService = churchesService;
    }
    getInviteByToken(token) {
        return this.churchesService.getInviteByToken(token);
    }
};
exports.PublicChurchInvitesController = PublicChurchInvitesController;
__decorate([
    (0, common_1.Get)(":token/public"),
    (0, swagger_1.ApiOperation)({ summary: "Consultar invitación por token (público)" }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicChurchInvitesController.prototype, "getInviteByToken", null);
exports.PublicChurchInvitesController = PublicChurchInvitesController = __decorate([
    (0, swagger_1.ApiTags)("churches"),
    (0, common_1.Controller)("churches/invites"),
    __metadata("design:paramtypes", [churches_service_1.ChurchesService])
], PublicChurchInvitesController);
//# sourceMappingURL=churches.controller.js.map