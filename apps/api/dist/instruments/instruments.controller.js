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
exports.InstrumentsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const tenant_decorator_1 = require("../common/decorators/tenant.decorator");
const instruments_service_1 = require("./instruments.service");
let InstrumentsController = class InstrumentsController {
    constructor(instrumentsService) {
        this.instrumentsService = instrumentsService;
    }
    findAll(churchId) {
        return this.instrumentsService.findAll(churchId);
    }
    create(churchId, name, icon) {
        return this.instrumentsService.create(churchId, name, icon);
    }
    update(churchId, id, name, icon) {
        return this.instrumentsService.update(churchId, id, name, icon);
    }
    remove(churchId, id) {
        return this.instrumentsService.remove(churchId, id);
    }
    reorder(churchId, orderedIds) {
        return this.instrumentsService.reorder(churchId, orderedIds);
    }
};
exports.InstrumentsController = InstrumentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar instrumentos de la iglesia' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstrumentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Crear instrumento personalizado' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Body)('icon')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], InstrumentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Editar instrumento' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('name')),
    __param(3, (0, common_1.Body)('icon')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], InstrumentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar instrumento' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InstrumentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, roles_decorator_1.Roles)(client_1.MemberRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Reordenar instrumentos' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, tenant_decorator_1.CurrentTenant)()),
    __param(1, (0, common_1.Body)('orderedIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], InstrumentsController.prototype, "reorder", null);
exports.InstrumentsController = InstrumentsController = __decorate([
    (0, swagger_1.ApiTags)('instruments'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('instruments'),
    __metadata("design:paramtypes", [instruments_service_1.InstrumentsService])
], InstrumentsController);
//# sourceMappingURL=instruments.controller.js.map