import { ConfigService } from '@nestjs/config'
import { getAppUrl } from './app-url'

const configWith = (value?: string) => ({ get: () => value }) as unknown as ConfigService

describe('getAppUrl', () => {
  it('uses the first origin when FRONTEND_URL lists several', () => {
    expect(getAppUrl(configWith('https://a.vercel.app/, https://b.example'))).toBe('https://a.vercel.app')
  })

  it('falls back to localhost in development', () => {
    expect(getAppUrl(configWith(undefined))).toBe('http://localhost:3000')
  })
})
