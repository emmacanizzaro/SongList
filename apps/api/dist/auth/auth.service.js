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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        const normalizedEmail = dto.email.toLowerCase();
        if (dto.inviteToken) {
            const invite = await this.prisma.churchInvite.findUnique({
                where: { token: dto.inviteToken },
            });
            if (!invite) {
                throw new common_1.NotFoundException("Invitación no encontrada");
            }
            if (invite.acceptedAt) {
                throw new common_1.ConflictException("Esta invitación ya fue utilizada");
            }
            if (invite.expiresAt < new Date()) {
                throw new common_1.ConflictException("Esta invitación ha expirado");
            }
            if (invite.email !== normalizedEmail) {
                throw new common_1.ConflictException("El email no coincide con la invitación");
            }
            const existingInvitedUser = await this.prisma.user.findUnique({
                where: { email: normalizedEmail },
                include: {
                    memberships: {
                        where: { churchId: invite.churchId },
                        take: 1,
                    },
                },
            });
            if (existingInvitedUser) {
                const existingMembership = existingInvitedUser.memberships[0];
                const isPendingInvite = existingInvitedUser.name.startsWith("Invitado ") &&
                    Boolean(existingMembership);
                if (!isPendingInvite) {
                    throw new common_1.ConflictException("El email ya está registrado");
                }
                const passwordHash = await bcrypt.hash(dto.password, 12);
                const updatedUser = await this.prisma.user.update({
                    where: { id: existingInvitedUser.id },
                    data: {
                        name: dto.name,
                        passwordHash,
                    },
                });
                await this.prisma.churchInvite.update({
                    where: { token: dto.inviteToken },
                    data: { acceptedAt: new Date() },
                });
                return this.issueTokens(updatedUser.id, updatedUser.email, invite.churchId, existingMembership.role);
            }
            const passwordHash = await bcrypt.hash(dto.password, 12);
            const result = await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email: normalizedEmail,
                        passwordHash,
                        name: dto.name,
                    },
                });
                const membership = await tx.membership.create({
                    data: {
                        userId: user.id,
                        churchId: invite.churchId,
                        role: invite.role,
                    },
                });
                await tx.churchInvite.update({
                    where: { token: dto.inviteToken },
                    data: { acceptedAt: new Date() },
                });
                return { user, membership };
            });
            return this.issueTokens(result.user.id, result.user.email, invite.churchId, result.membership.role);
        }
        if (!dto.churchName) {
            throw new common_1.ConflictException("El nombre de iglesia es obligatorio");
        }
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
            include: {
                memberships: {
                    orderBy: { joinedAt: "asc" },
                    take: 1,
                },
            },
        });
        if (existing) {
            const isPendingInvite = existing.name.startsWith("Invitado ") &&
                existing.memberships.length > 0;
            if (!isPendingInvite) {
                throw new common_1.ConflictException("El email ya está registrado");
            }
            const passwordHash = await bcrypt.hash(dto.password, 12);
            const updatedUser = await this.prisma.user.update({
                where: { id: existing.id },
                data: {
                    name: dto.name,
                    passwordHash,
                    email: normalizedEmail,
                },
            });
            const membership = existing.memberships[0];
            return this.issueTokens(updatedUser.id, updatedUser.email, membership.churchId, membership.role);
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const slug = this.generateSlug(dto.churchName);
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: normalizedEmail,
                    passwordHash,
                    name: dto.name,
                },
            });
            let finalSlug = slug;
            const existingChurch = await tx.church.findUnique({ where: { slug } });
            if (existingChurch)
                finalSlug = `${slug}-${Date.now()}`;
            const church = await tx.church.create({
                data: {
                    name: dto.churchName,
                    slug: finalSlug,
                    subscription: { create: { plan: "FREE", status: "ACTIVE" } },
                    instruments: {
                        createMany: {
                            data: [
                                { name: "Guitarra", icon: "🎸", sortOrder: 1 },
                                { name: "Bajo", icon: "🎸", sortOrder: 2 },
                                { name: "Piano/Teclado", icon: "🎹", sortOrder: 3 },
                                { name: "Batería", icon: "🥁", sortOrder: 4 },
                                { name: "Voz Principal", icon: "🎤", sortOrder: 5 },
                                { name: "Coros", icon: "🎵", sortOrder: 6 },
                            ],
                        },
                    },
                },
            });
            const membership = await tx.membership.create({
                data: { userId: user.id, churchId: church.id, role: "ADMIN" },
            });
            return { user, church, membership };
        });
        return this.issueTokens(result.user.id, result.user.email, result.church.id, "ADMIN");
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
            include: {
                memberships: {
                    include: { church: true },
                    orderBy: { joinedAt: "asc" },
                },
            },
        });
        if (!user)
            throw new common_1.UnauthorizedException("Credenciales inválidas");
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid)
            throw new common_1.UnauthorizedException("Credenciales inválidas");
        if (user.memberships.length === 0) {
            throw new common_1.UnauthorizedException("No perteneces a ninguna iglesia");
        }
        const primaryMembership = user.memberships[0];
        return this.issueTokens(user.id, user.email, primaryMembership.churchId, primaryMembership.role);
    }
    async switchChurch(userId, churchId) {
        const membership = await this.prisma.membership.findUnique({
            where: { userId_churchId: { userId, churchId } },
        });
        if (!membership)
            throw new common_1.NotFoundException("No eres miembro de esta iglesia");
        return this.issueTokens(userId, "", churchId, membership.role);
    }
    async refreshTokens(rawRefreshToken) {
        const tokenHash = this.hashToken(rawRefreshToken);
        const stored = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: {
                user: {
                    include: {
                        memberships: { orderBy: { joinedAt: "asc" }, take: 1 },
                    },
                },
            },
        });
        if (!stored || stored.expiresAt < new Date()) {
            if (stored) {
                await this.prisma.refreshToken.delete({ where: { tokenHash } });
            }
            throw new common_1.UnauthorizedException("Refresh token inválido o expirado");
        }
        await this.prisma.refreshToken.delete({ where: { tokenHash } });
        const membership = stored.user.memberships[0];
        return this.issueTokens(stored.userId, stored.user.email, membership.churchId, membership.role);
    }
    async logout(rawRefreshToken) {
        const tokenHash = this.hashToken(rawRefreshToken);
        await this.prisma.refreshToken
            .delete({ where: { tokenHash } })
            .catch(() => null);
    }
    async issueTokens(userId, email, churchId, role) {
        const payload = { sub: userId, email, churchId, role };
        const accessToken = await this.jwt.signAsync(payload, {
            secret: this.config.getOrThrow("JWT_SECRET"),
            expiresIn: this.config.get("JWT_EXPIRES_IN", "15m"),
        });
        const rawRefreshToken = crypto.randomBytes(48).toString("hex");
        const tokenHash = this.hashToken(rawRefreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: { userId, tokenHash, expiresAt },
        });
        return { accessToken, refreshToken: rawRefreshToken };
    }
    hashToken(token) {
        return crypto.createHash("sha256").update(token).digest("hex");
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .slice(0, 50);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map