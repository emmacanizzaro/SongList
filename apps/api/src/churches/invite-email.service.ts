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
    const frontendUrl = this.config.get<string>(
      "FRONTEND_URL",
      "http://localhost:3000",
    );
    const inviteUrl = `${frontendUrl.replace(/\/$/, "")}/register?invite=${token}`;

    const apiKey = this.config.get<string>("RESEND_API_KEY");
    const from =
      this.config.get<string>("INVITE_EMAIL_FROM") ??
      this.config.get<string>("EMAIL_FROM");

    if (!apiKey || !from) {
      return { emailSent: false, inviteUrl };
    }

    const expiresAtText = new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(expiresAt);

    const subject = `${churchName} te invitó a SongList`;
    const text = [
      `Has sido invitado a unirte a ${churchName} en SongList como ${this.getRoleLabel(role)}.`,
      `Acepta tu invitación aquí: ${inviteUrl}`,
      `La invitación expira el ${expiresAtText}.`,
    ].join("\n\n");

    const html = `
      <div style="font-family: Inter, Arial, sans-serif; background: #f8fafc; padding: 24px; color: #0f172a;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid rgba(15, 23, 42, 0.08);">
          <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #1d4ed8; font-weight: 700;">SongList</p>
          <h1 style="margin: 0 0 12px; font-size: 28px; line-height: 1.15;">Te invitaron a ${churchName}</h1>
          <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #475569;">
            Tu rol será <strong>${this.getRoleLabel(role)}</strong>. Usa este enlace para aceptar la invitación y crear tu acceso.
          </p>
          <a href="${inviteUrl}" style="display: inline-block; padding: 14px 20px; border-radius: 14px; background: #1d4ed8; color: #ffffff; text-decoration: none; font-weight: 700;">Aceptar invitación</a>
          <p style="margin: 20px 0 0; font-size: 13px; line-height: 1.6; color: #64748b;">
            Este enlace expira el ${expiresAtText}. Si no esperabas esta invitación, puedes ignorar este correo.
          </p>
          <p style="margin: 16px 0 0; font-size: 12px; line-height: 1.6; color: #94a3b8; word-break: break-all;">
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
