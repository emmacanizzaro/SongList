"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var WelcomeEmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeEmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let WelcomeEmailService = (WelcomeEmailService_1 = class WelcomeEmailService {
  constructor(config) {
    this.config = config;
    this.logger = new common_1.Logger(WelcomeEmailService_1.name);
  }
  async sendWelcomeEmail({ email, name }) {
    const apiKey = this.config.get("RESEND_API_KEY");
    const from =
      this.config.get("INVITE_EMAIL_FROM") ?? this.config.get("EMAIL_FROM");
    if (!apiKey || !from) {
      return { emailSent: false };
    }
    const subject = `Tu registro a SongList se confirmó con éxito`;
    const text = [
      `Hola ${name},`,
      `Tu registro a SongList se confirmó con éxito.`,
      `¡Comienza a organizar tu equipo de alabanza hoy mismo!`,
      `\n\nEmmanuel Canizzaro - Product Manager`,
    ].join("\n\n");
    const html = `
      <div style="font-family: Inter, Arial, sans-serif; background: #f6f4ef; padding: 24px; color: #132033;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 18px 40px rgba(22, 43, 73, 0.08);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px;">
            <div style="font-size: 28px; font-weight: 800; color: #1d4ed8; font-family: Inter, Arial, sans-serif; letter-spacing: 0.12em;">SongList</div>
          </div>
          <h1 style="margin: 0 0 18px; font-size: 26px; line-height: 1.15; font-family: Inter, Arial, sans-serif; color: #132033;">Tu registro a SongList se confirmó con éxito</h1>
          <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #475569; font-family: Inter, Arial, sans-serif;">
            Hola <strong>${name}</strong>,<br />
            ¡Bienvenido a <span style='color:#1d4ed8;font-weight:700;'>SongList</span>!<br />
            Tu registro se confirmó correctamente.<br />
            Ya puedes comenzar a organizar tu equipo de alabanza, cargar canciones y programar reuniones.
          </p>
          <a href="https://songlist.app" style="display: inline-block; padding: 14px 20px; border-radius: 14px; background: #1d4ed8; color: #ffffff; text-decoration: none; font-weight: 700; font-family: Inter, Arial, sans-serif;">Ir a SongList</a>
          <p style="margin: 32px 0 0; font-size: 15px; line-height: 1.6; color: #64748b; font-family: Inter, Arial, sans-serif;">
            Si tienes dudas o necesitas ayuda, responde a este correo.<br />
            <span style="display:block;margin-top:18px;font-size:15px;color:#1d4ed8;font-weight:700;">Emmanuel Canizzaro - Product Manager</span>
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
          `No se pudo enviar bienvenida a ${email}: ${response.status}`,
        );
        return { emailSent: false };
      }
      return { emailSent: true };
    } catch (error) {
      this.logger.warn(
        `Error enviando bienvenida a ${email}: ${String(error)}`,
      );
      return { emailSent: false };
    }
  }
});
exports.WelcomeEmailService = WelcomeEmailService;
exports.WelcomeEmailService =
  WelcomeEmailService =
  WelcomeEmailService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [config_1.ConfigService]),
      ],
      WelcomeEmailService,
    );
//# sourceMappingURL=welcome-email.service.js.map
