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
exports.SongsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const songs_service_1 = require("./songs.service");
const create_song_dto_1 = require("./dto/create-song.dto");
let SongsController = class SongsController {
    constructor(songsService) {
        this.songsService = songsService;
    }
    create(churchId, userId, dto) {
        return this.songsService.create(churchId, userId, dto);
    }
    findAll(churchId, search) {
        return this.songsService.findAll(churchId, search);
    }
    findOne(churchId, id) {
        return this.songsService.findOne(churchId, id);
    }
    update(churchId, id, dto) {
        return this.songsService.update(churchId, id, dto);
    }
    remove(churchId, id) {
        return this.songsService.remove(churchId, id);
    }
    addVersion(churchId, songId, type, targetKey, notes) {
        return this.songsService.addVersion(churchId, songId, type, targetKey, notes);
    }
    liveTranspose(churchId, songId, targetKey) {
        return this.songsService.getLiveTransposition(churchId, songId, targetKey);
    }
};
exports.SongsController = SongsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Crear canción' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_song_dto_1.CreateSongDto]),
    __metadata("design:returntype", void 0)
], SongsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar canciones (con búsqueda)' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SongsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener canción con todas las versiones' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SongsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Editar canción' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], SongsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar canción' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SongsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/versions'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.EDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Generar versión transpuesta (hombre/mujer/custom)' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('type')),
    __param(3, (0, common_1.Body)('targetKey')),
    __param(4, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SongsController.prototype, "addVersion", null);
__decorate([
    (0, common_1.Get)(':id/transpose'),
    (0, swagger_1.ApiOperation)({ summary: 'Transposición en vivo (sin guardar)' }),
    (0, swagger_1.ApiQuery)({ name: 'key', required: true, description: 'Tonalidad destino: C, F#, Bb, etc.' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SongsController.prototype, "liveTranspose", null);
exports.SongsController = SongsController = __decorate([
    (0, swagger_1.ApiTags)('songs'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('songs'),
    __metadata("design:paramtypes", [songs_service_1.SongsService])
], SongsController);
//# sourceMappingURL=songs.controller.js.map