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
var InviteEmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteEmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
let InviteEmailService = InviteEmailService_1 = class InviteEmailService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(InviteEmailService_1.name);
    }
    async sendInviteEmail({ email, churchName, role, token, expiresAt, }) {
        this.logger.warn("Entrando a sendInviteEmail");
        const frontendUrl = this.config.get("FRONTEND_URL", "http://localhost:3000");
        const inviteUrl = `${frontendUrl.replace(/\/$/, "")}/register?invite=${token}`;
        const apiKey = this.config.get("RESEND_API_KEY");
        const from = this.config.get("INVITE_EMAIL_FROM") ??
            this.config.get("EMAIL_FROM");
        this.logger.warn(`RESEND_API_KEY: ${apiKey}, INVITE_EMAIL_FROM: ${from}`);
        if (!apiKey || !from) {
            return { emailSent: false, inviteUrl };
        }
        const expiresAtText = new Intl.DateTimeFormat("es-ES", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(expiresAt);
        const subject = `¡Bienvenido a SongList! Tu acceso está listo`;
        const text = [
            `¡Bienvenido a SongList!`,
            `Has sido invitado a unirte a ${churchName} como ${this.getRoleLabel(role)}.`,
            `Tu registro a SongList se confirmó con éxito.`,
            `Accede a tu equipo usando este enlace: ${inviteUrl}`,
            `La invitación expira el ${expiresAtText}.`,
            `\n\nEmmanuel Canizzaro - Product Manager`,
        ].join("\n\n");
        const html = `
      <div style="font-family: Inter, Arial, sans-serif; background: #f6f4ef; padding: 24px; color: #132033;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 18px 40px rgba(22, 43, 73, 0.08);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px;">
            <div style="font-size: 28px; font-weight: 800; color: #1d4ed8; font-family: Inter, Arial, sans-serif; letter-spacing: 0.12em;">SongList</div>
          </div>
          <h1 style="margin: 0 0 18px; font-size: 26px; line-height: 1.15; font-family: Inter, Arial, sans-serif; color: #132033;">¡Bienvenido a SongList!</h1>
          <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #475569; font-family: Inter, Arial, sans-serif;">
            Has sido invitado a unirte a <strong>${churchName}</strong> como <strong>${this.getRoleLabel(role)}</strong>.<br />
            Tu registro a SongList se confirmó con éxito.<br />
            Accede a tu equipo usando el siguiente enlace:
          </p>
          <a href="${inviteUrl}" style="display: inline-block; padding: 14px 20px; border-radius: 14px; background: #1d4ed8; color: #ffffff; text-decoration: none; font-weight: 700; font-family: Inter, Arial, sans-serif;">Aceptar invitación</a>
          <p style="margin: 20px 0 0; font-size: 13px; line-height: 1.6; color: #64748b; font-family: Inter, Arial, sans-serif;">
            Este enlace expira el ${expiresAtText}. Si no esperabas esta invitación, puedes ignorar este correo.<br />
            <span style="display:block;margin-top:18px;font-size:15px;color:#1d4ed8;font-weight:700;">Emmanuel Canizzaro - Product Manager</span>
          </p>
          <p style="margin: 16px 0 0; font-size: 12px; line-height: 1.6; color: #94a3b8; word-break: break-all; font-family: Inter, Arial, sans-serif;">
            ${inviteUrl}
          </p>
        </div>
      </div>
    `;
        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from,
                    to: [email],
                    subject,
                    html,
                    text,
                }),
            });
            if (!response.ok) {
                this.logger.warn(`No se pudo enviar invitación a ${email}: ${response.status}`);
                return { emailSent: false, inviteUrl };
            }
            return { emailSent: true, inviteUrl };
        }
        catch (error) {
            this.logger.warn(`Error enviando invitación a ${email}: ${String(error)}`);
            return { emailSent: false, inviteUrl };
        }
    }
    getRoleLabel(role) {
        switch (role) {
            case client_1.MemberRole.ADMIN:
                return "Administrador";
            case client_1.MemberRole.EDITOR:
                return "Editor";
            default:
                return "Visualizador";
        }
    }
};
exports.InviteEmailService = InviteEmailService;
exports.InviteEmailService = InviteEmailService = InviteEmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], InviteEmailService);
//# sourceMappingURL=invite-email.service.js.map