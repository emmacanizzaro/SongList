import { PlanType } from '@prisma/client'
import { getAccessState, getPlanLimits, PLAN_PRICES_USD, trialEndDate } from './plan-limits'

const NOW = new Date('2026-10-20T12:00:00Z')
const PAST = new Date('2026-10-01T00:00:00Z')
const FUTURE = new Date('2026-11-01T00:00:00Z')

describe('plan limits', () => {
  it('matches the business rules for each plan', () => {
    expect(getPlanLimits(PlanType.FREE)).toMatchObject({ maxMembers: 10, maxSongs: 20 })
    expect(getPlanLimits(PlanType.PRO)).toMatchObject({ maxMembers: 30, maxSongs: 50 })
    expect(getPlanLimits(PlanType.ENTERPRISE)).toMatchObject({ maxMembers: 60, maxSongs: 150 })
    expect(getPlanLimits(PlanType.UNLIMITED)).toMatchObject({ maxMembers: -1, maxSongs: -1 })
  })

  it('prices PRO and ENTERPRISE in USD and does not sell FREE or UNLIMITED', () => {
    expect(PLAN_PRICES_USD).toEqual({
      FREE: null,
      PRO: 9.99,
      ENTERPRISE: 19.99,
      UNLIMITED: null,
    })
  })

  it('creates trials that end 30 days later', () => {
    expect(trialEndDate(NOW).toISOString()).toBe('2026-11-19T12:00:00.000Z')
  })
})

describe('getAccessState', () => {
  const base = { trialEndsAt: null, currentPeriodEnd: null }

  it('keeps a FREE church active during the trial and read-only after it', () => {
    expect(getAccessState({ ...base, plan: PlanType.FREE, trialEndsAt: FUTURE }, NOW)).toBe('active')
    expect(getAccessState({ ...base, plan: PlanType.FREE, trialEndsAt: PAST }, NOW)).toBe('trial_expired')
  })

  it('makes paid plans read-only once the paid period ends, if one is set', () => {
    expect(getAccessState({ ...base, plan: PlanType.PRO, currentPeriodEnd: FUTURE }, NOW)).toBe('active')
    expect(getAccessState({ ...base, plan: PlanType.PRO, currentPeriodEnd: PAST }, NOW)).toBe('period_expired')
    expect(getAccessState({ ...base, plan: PlanType.ENTERPRISE }, NOW)).toBe('active')
  })

  it('never expires UNLIMITED, even with stale dates', () => {
    expect(
      getAccessState({ plan: PlanType.UNLIMITED, trialEndsAt: PAST, currentPeriodEnd: PAST }, NOW),
    ).toBe('active')
  })
})
