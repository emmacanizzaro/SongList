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
exports.PublicMeetingsController = exports.MeetingsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const meetings_service_1 = require("./meetings.service");
const create_meeting_dto_1 = require("./dto/create-meeting.dto");
let MeetingsController = class MeetingsController {
    constructor(meetingsService) {
        this.meetingsService = meetingsService;
    }
    create(churchId, userId, dto) {
        return this.meetingsService.create(churchId, userId, dto);
    }
    findAll(churchId, upcoming) {
        return this.meetingsService.findAll(churchId, upcoming);
    }
    findOne(churchId, id) {
        return this.meetingsService.findOne(churchId, id);
    }
    update(churchId, id, dto) {
        return this.meetingsService.update(churchId, id, dto);
    }
    remove(churchId, id) {
        return this.meetingsService.remove(churchId, id);
    }
    addSong(churchId, meetingId, songId, keyOverride, notes) {
        return this.meetingsService.addSong(churchId, meetingId, songId, keyOverride, notes);
    }
    reorderSongs(churchId, meetingId, orderedSongIds) {
        return this.meetingsService.reorderSongs(churchId, meetingId, orderedSongIds);
    }
    removeSong(churchId, meetingId, meetingSongId) {
        return this.meetingsService.removeSong(churchId, meetingId, meetingSongId);
    }
    assign(meetingId, userId, instrumentId, notes) {
        return this.meetingsService.assignMusician(meetingId, userId, instrumentId, notes);
    }
    unassign(meetingId, assignmentId) {
        return this.meetingsService.unassignMusician(meetingId, assignmentId);
    }
    generateShare(churchId, meetingId) {
        return this.meetingsService.generateShareLink(churchId, meetingId);
    }
};
exports.MeetingsController = MeetingsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Crear reunión' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_meeting_dto_1.CreateMeetingDto]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar reuniones' }),
    (0, swagger_1.ApiQuery)({ name: 'upcoming', required: false, type: Boolean }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('upcoming')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener reunión con canciones y asignaciones' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Editar reunión' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar reunión' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/songs'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Agregar canción a la reunión' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('songId')),
    __param(3, (0, common_1.Body)('keyOverride')),
    __param(4, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "addSong", null);
__decorate([
    (0, common_1.Patch)(':id/songs/reorder'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Reordenar canciones de la reunión' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('orderedSongIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "reorderSongs", null);
__decorate([
    (0, common_1.Delete)(':id/songs/:meetingSongId'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Quitar canción de la reunión' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('meetingSongId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "removeSong", null);
__decorate([
    (0, common_1.Post)(':id/assignments'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Asignar músico a la reunión' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('instrumentId')),
    __param(3, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "assign", null);
__decorate([
    (0, common_1.Delete)(':id/assignments/:assignmentId'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar asignación' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('assignmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "unassign", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Generar link público de solo lectura' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "generateShare", null);
exports.MeetingsController = MeetingsController = __decorate([
    (0, swagger_1.ApiTags)('meetings'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('meetings'),
    __metadata("design:paramtypes", [meetings_service_1.MeetingsService])
], MeetingsController);
const common_2 = require("@nestjs/common");
let PublicMeetingsController = class PublicMeetingsController {
    constructor(meetingsService) {
        this.meetingsService = meetingsService;
    }
    findByToken(token) {
        return this.meetingsService.findByShareToken(token);
    }
};
exports.PublicMeetingsController = PublicMeetingsController;
__decorate([
    (0, common_1.Get)(':token'),
    (0, swagger_1.ApiOperation)({ summary: 'Ver reunión compartida (sin autenticación)' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicMeetingsController.prototype, "findByToken", null);
exports.PublicMeetingsController = PublicMeetingsController = __decorate([
    (0, swagger_1.ApiTags)('meetings'),
    (0, common_2.Controller)('public/meetings'),
    __metadata("design:paramtypes", [meetings_service_1.MeetingsService])
], PublicMeetingsController);
//# sourceMappingURL=meetings.controller.js.map