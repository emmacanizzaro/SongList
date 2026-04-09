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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSongDto = exports.CreateSongVersionDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateSongVersionDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { type: { required: true, type: () => Object }, key: { required: true, type: () => String }, lyricsChords: { required: true, type: () => String }, notes: { required: false, type: () => String } };
    }
}
exports.CreateSongVersionDto = CreateSongVersionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.VersionType }),
    (0, class_validator_1.IsEnum)(client_1.VersionType),
    __metadata("design:type", String)
], CreateSongVersionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "F#" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSongVersionDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "[C]Amazing [G]grace\nhow [Am]sweet the [F]sound" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSongVersionDto.prototype, "lyricsChords", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSongVersionDto.prototype, "notes", void 0);
class CreateSongDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: true, type: () => String, minLength: 1, maxLength: 200 }, artist: { required: false, type: () => String, maxLength: 100 }, originalKey: { required: true, type: () => String }, bpm: { required: false, type: () => Number, minimum: 40, maximum: 300 }, tags: { required: false, type: () => [String] }, version: { required: false, type: () => require("./create-song.dto").CreateSongVersionDto } };
    }
}
exports.CreateSongDto = CreateSongDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Amazing Grace" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateSongDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "John Newton" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateSongDto.prototype, "artist", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "C" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSongDto.prototype, "originalKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 72 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(40),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], CreateSongDto.prototype, "bpm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ["adoracion", "clasico"] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateSongDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Versión original de la canción" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateSongVersionDto)
], CreateSongDto.prototype, "version", void 0);
//# sourceMappingURL=create-song.dto.js.map