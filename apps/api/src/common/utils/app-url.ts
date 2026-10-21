import { ConfigService } from '@nestjs/config'

/**
 * Public URL of the web app, used in email links.
 * FRONTEND_URL may list several origins separated by commas (for CORS);
 * the first one is the canonical app URL.
 */
export function getAppUrl(config: ConfigService): string {
  const first = (config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000').split(',')[0].trim()
  return first.replace(/\/$/, '')
}
