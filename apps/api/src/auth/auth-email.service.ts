import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { getAppUrl } from '../common/utils/app-url'
import { escapeHtml } from '../common/utils/escape-html'
import { MailerService } from '../common/services/mailer.service'
import { APP_NAME } from '../common/constants/brand'

interface LinkEmail {
  heading: string
  intro: string
  buttonLabel: string
  url: string
  footnote: string
}

function renderEmail({ heading, intro, buttonLabel, url, footnote }: LinkEmail) {
  // url is built by us from the app URL and a hex token, but we still escape
  // it so the template stays safe if that ever changes.
  const safeUrl = escapeHtml(url)
  return `
    <div style="font-family: Inter, Arial, sans-serif; background: #f6f4ef; padding: 24px; color: #132033;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e5e7eb;">
        <div style="font-size: 24px; font-weight: 800; color: #1d4ed8; letter-spacing: 0.12em; margin-bottom: 18px;">${APP_NAME}</div>
        <h1 style="margin: 0 0 16px; font-size: 22px; line-height: 1.2; color: #132033;">${heading}</h1>
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">${intro}</p>
        <a href="${safeUrl}" style="display: inline-block; padding: 14px 20px; border-radius: 14px; background: #1d4ed8; color: #ffffff; text-decoration: none; font-weight: 700;">${buttonLabel}</a>
        <p style="margin: 24px 0 0; font-size: 13px; line-height: 1.6; color: #64748b;">
          ${footnote}<br />Si el botón no funciona, copia este enlace:<br />
          <span style="word-break: break-all;">${safeUrl}</span>
        </p>
      </div>
    </div>
  `
}

@Injectable()
export class AuthEmailService {
  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  isEnabled() {
    return this.mailer.isConfigured()
  }

  sendEmailVerification(email: string, name: string, token: string) {
    const url = `${getAppUrl(this.config)}/verify-email?token=${token}`
    return this.mailer.send({
      to: email,
      subject: `Confirma tu email en ${APP_NAME}`,
      text: `Hola ${name}, confirma tu email entrando a: ${url}\nEl enlace vence en 24 horas.`,
      html: renderEmail({
        heading: `Hola ${escapeHtml(name)}, confirma tu email`,
        intro: `Gracias por registrarte en ${APP_NAME}. Confirma que este email es tuyo para proteger tu cuenta.`,
        buttonLabel: 'Confirmar email',
        url,
        footnote: 'El enlace vence en 24 horas. Si no creaste una cuenta, ignora este mensaje.',
      }),
    })
  }

  sendPasswordReset(email: string, name: string, token: string) {
    const url = `${getAppUrl(this.config)}/reset-password?token=${token}`
    return this.mailer.send({
      to: email,
      subject: `Restablece tu contraseña de ${APP_NAME}`,
      text: `Hola ${name}, para elegir una contraseña nueva entra a: ${url}\nEl enlace vence en 1 hora y solo se puede usar una vez.`,
      html: renderEmail({
        heading: 'Restablece tu contraseña',
        intro: `Hola ${escapeHtml(name)}, recibimos un pedido para cambiar la contraseña de tu cuenta.`,
        buttonLabel: 'Elegir contraseña nueva',
        url,
        footnote:
          'El enlace vence en 1 hora y solo se puede usar una vez. Si no lo pediste, ignora este mensaje: tu contraseña no cambia.',
      }),
    })
  }
}
