# SongList

SongList is a multi-tenant SaaS platform for worship teams.
It helps churches plan meetings, organize songs, assign musicians, and share setlists from one place.

[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014-black)](#tech-stack)
[![Backend](https://img.shields.io/badge/Backend-NestJS-red)](#tech-stack)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)](#tech-stack)
[![ORM](https://img.shields.io/badge/ORM-Prisma-2D3748)](#tech-stack)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## Why SongList

- Keeps worship planning centralized and easy to share.
- Supports multi-church membership with tenant-safe data isolation.
- Includes chord transposition and role-based collaboration.
- Built as a real product architecture, not only a UI prototype.

## Core Features

- Multi-tenant auth with church context in JWT.
- Role-based access (`ADMIN`, `EDITOR`, `READER`).
- Song management with versions and real-time transposition.
- Meeting planning with drag-and-drop song ordering.
- Musician assignments by instrument.
- Public share links for meetings.
- Subscription-ready backend with Stripe support.

## Product Preview

Add screenshots or gifs here to increase conversion on your profile:

```
docs/images/dashboard.png
docs/images/song-editor.png
docs/images/meeting-planner.png
docs/images/mobile-share-view.png
```

## Tech Stack

| Layer    | Technology                                     |
| -------- | ---------------------------------------------- |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend  | NestJS, TypeScript                             |
| Database | PostgreSQL                                     |
| ORM      | Prisma                                         |
| Auth     | JWT + refresh token rotation                   |
| Realtime | Socket.IO                                      |
| Payments | Stripe                                         |
| Tooling  | Turborepo, ESLint, Jest                        |

## Monorepo Structure

```text
songlist/
  apps/
    api/        # NestJS API
    web/        # Next.js app
  packages/
    shared/     # Shared types and utilities
```

## Architecture Notes

### Multi-tenancy

Each church is isolated as a tenant. The active `churchId` is carried in JWT claims and injected into API requests to scope all queries.

```text
Browser -> JWT(sub, churchId, role) -> API
                                  -> tenant-aware service queries
```

### Invitation flow

Admins invite members with a unique tokenized link. Registrations made through the invite token are automatically attached to the same church tenant.

## API Snapshot

| Method | Endpoint                         | Description            |
| ------ | -------------------------------- | ---------------------- |
| POST   | `/api/v1/auth/register`          | Register user + tenant |
| POST   | `/api/v1/auth/login`             | Sign in                |
| POST   | `/api/v1/auth/refresh`           | Rotate tokens          |
| GET    | `/api/v1/songs`                  | List songs             |
| POST   | `/api/v1/meetings`               | Create meeting         |
| GET    | `/api/v1/public/meetings/:token` | Public share view      |

## Local Setup

### Requirements

- Node.js 20+
- npm 10+
- PostgreSQL 15+

### Run locally

```bash
npm install

# configure env files for web and api
npm run db:migrate
npm run dev
```

Local services:

- Web: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/docs

## Quality and Operations

- Onboarding: [ONBOARDING.md](ONBOARDING.md)
- Quality checklist: [QUALITY_CHECKLIST.md](QUALITY_CHECKLIST.md)
- Release checklist: [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)
- Deployment notes: [DEPLOY_ENV.md](DEPLOY_ENV.md)

## Roadmap

- [ ] PDF export for setlists
- [ ] Email reminders for upcoming meetings
- [ ] Offline-ready mode for rehearsals
- [ ] Mobile app (React Native / Expo)
- [ ] Advanced analytics for songs and team activity

## Contributing

Contributions, issues, and feature suggestions are welcome.
Please open an issue first to discuss major changes.
