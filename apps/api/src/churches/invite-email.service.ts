import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MemberRole } from "@prisma/client";

interface SendInviteEmailParams {
  email: string;
  churchName: string;
  role: MemberRole;
  token: string;
  expiresAt: Date;
}

@Injectable()
export class InviteEmailService {
  private readonly logger = new Logger(InviteEmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendInviteEmail({
    email,
    churchName,
    role,
    token,
    expiresAt,
  }: SendInviteEmailParams): Promise<{
    emailSent: boolean;
    inviteUrl: string;
  }> {
    this.logger.warn("Entrando a sendInviteEmail");
    const frontendUrl = this.config.get<string>(
      "FRONTEND_URL",
      "http://localhost:3000",
    );
    const inviteUrl = `${frontendUrl.replace(/\/$/, "")}/register?invite=${token}`;

    const apiKey = this.config.get<string>("RESEND_API_KEY");
    const from =
      this.config.get<string>("INVITE_EMAIL_FROM") ??
      this.config.get<string>("EMAIL_FROM");

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
        this.logger.warn(
          `No se pudo enviar invitación a ${email}: ${response.status}`,
        );
        return { emailSent: false, inviteUrl };
      }

      return { emailSent: true, inviteUrl };
    } catch (error) {
      this.logger.warn(
        `Error enviando invitación a ${email}: ${String(error)}`,
      );
      return { emailSent: false, inviteUrl };
    }
  }

  private getRoleLabel(role: MemberRole) {
    switch (role) {
      case MemberRole.ADMIN:
        return "Administrador";
      case MemberRole.EDITOR:
        return "Editor";
      default:
        return "Visualizador";
    }
  }
}
