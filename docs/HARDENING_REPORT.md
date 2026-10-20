# SongList Hardening Report

Date: 2026-05-06

## 1. Current Health Snapshot

- Lint: passing
- Build: passing
- Tests: passing

This confirms the codebase compiles and runs correctly in its current dependency set.

## 2. Dependency Drift Summary

The project has two classes of pending updates:

- Safe incremental updates (same major): can be scheduled soon.
- Breaking major upgrades: should be done in a dedicated migration branch.

### Safe incremental updates (recommended first)

- turbo: 2.9.5 -> 2.9.9
- axios (web): 1.15.1 -> 1.16.0
- @tanstack/react-query: 5.96.2 -> 5.100.9
- react-hook-form: 7.72.1 -> 7.75.0
- postcss: 8.5.9 -> 8.5.14
- autoprefixer: 10.4.27 -> 10.5.0

### Breaking major updates (plan as migration)

- Next.js 14 -> 16
- React 18 -> 19
- NestJS 10 -> 11
- Prisma 5 -> 7
- Stripe 14 -> 22
- Tailwind 3 -> 4
- Zod 3 -> 4

## 3. Security Audit Snapshot

Production audit currently reports 14 vulnerabilities:

- High: axios, multer, next-related advisories, lodash
- Moderate: NestJS core chain, js-yaml, file-type, postcss

Important context:

- A significant portion of findings are transitive and tied to framework major versions.
- Most automatic full fixes require breaking upgrades (npm audit fix --force).

## 4. Dist Tracking Policy

Observed behavior:

- Build-generated dist files under apps/api/dist and packages/shared/dist are appearing as modified.
- Current root ignore file does not ignore full dist directories.

Recommendation:

- Decide one policy and enforce consistently:
  - Policy A (recommended): do not version dist artifacts in git.
  - Policy B: keep dist versioned and always build before commit.

Preferred for this repo: Policy A.

Suggested follow-up changes:

- Add ignore rules for dist output directories.
- Remove tracked dist artifacts from git once, then rely on CI builds.

## 5. Priority Plan

### Phase 1 (today)

- Keep current code changes (already validated).
- Apply safe non-breaking dependency updates only.
- Re-run lint, build, test.

### Phase 2 (this week)

- Define and apply dist policy (recommended: ignore dist).
- Add CI guard that fails on lint, build, and tests.
- Add npm audit report to release checklist.

### Phase 3 (migration sprint)

- Create dedicated branch for framework major upgrades.
- Upgrade stack in this order:
  1. NestJS + Prisma (API)
  2. Next.js + React (Web)
  3. Tailwind + design updates
- Validate with regression checklist before merge.

## 6. Release Hardening Checklist

Before each release:

- npm ci
- npm run lint
- npm run build
- npm run test
- npm audit --omit=dev
- Verify environment variables in deployment targets
- Verify Stripe webhook signature path if billing changes were made
- Smoke test login, meeting creation, song transposition, and public share links

## 7. Suggested Next Action

Open a short maintenance PR with only safe minor/patch dependency updates, then run full validation.
