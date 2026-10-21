import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface MailMessage {
  to: string
  subject: string
  html: string
  text: string
}

/**
 * Sends transactional email through Resend.
 * Delivery is "off" until RESEND_API_KEY and EMAIL_FROM are configured; in that
 * state send() is a no-op and features that depend on email stay disabled.
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name)

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey() && this.from())
  }

  async send(message: MailMessage): Promise<boolean> {
    const apiKey = this.apiKey()
    const from = this.from()
    if (!apiKey || !from) return false

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      })

      if (!response.ok) {
        this.logger.warn(`Email "${message.subject}" not sent: HTTP ${response.status}`)
        return false
      }
      return true
    } catch (error) {
      this.logger.error(`Email "${message.subject}" failed: ${String(error)}`)
      return false
    }
  }

  private apiKey() {
    return this.config.get<string>('RESEND_API_KEY')
  }

  private from() {
    return this.config.get<string>('EMAIL_FROM') ?? this.config.get<string>('INVITE_EMAIL_FROM')
  }
}
