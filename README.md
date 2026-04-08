# 🎵 SongList SaaS

> Plataforma SaaS multi-tenant para equipos de alabanza de iglesias.

[![Stack](https://img.shields.io/badge/Stack-Next.js%20%2B%20NestJS%20%2B%20PostgreSQL-blue)](#stack)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

---

## Arquitectura del sistema

```
songlist/
├── apps/
│   ├── api/          ← NestJS API (Puerto 3001)
│   └── web/          ← Next.js 14 App Router (Puerto 3000)
└── packages/
    └── shared/       ← Tipos y utilidades compartidas
```

### Flujo de multi-tenancy

```
Browser  →  [JWT: { sub, email, churchId, role }]  →  API
                                  ↓
                        JwtStrategy.validate()
                          adjunta { churchId, currentRole }
                                  ↓
                        @CurrentTenant() → churchId
                                  ↓
                    Todos los queries: WHERE churchId = :id
```

Cada iglesia es un **tenant** aislado. Un usuario puede pertenecer a múltiples iglesias (multi-iglesia). El `churchId` activo viaja en el JWT — al hacer `switch-church` se genera un nuevo JWT apuntando al otro tenant.

---

## Stack tecnológico

| Capa              | Tecnología                   | Justificación                   |
| ----------------- | ---------------------------- | ------------------------------- |
| **Frontend**      | Next.js 14 (App Router)      | SSR, SEO, edge-ready            |
| **Backend**       | NestJS                       | Modular, tipado, decoradores    |
| **ORM**           | Prisma                       | Type-safe, migrations, multi-DB |
| **Base de datos** | PostgreSQL                   | ACID, relaciones, índices       |
| **Auth**          | JWT + Refresh tokens         | Stateless, escalable            |
| **Pagos**         | Stripe + Mercado Pago        | Global + LATAM                  |
| **Caché**         | Redis (opcional)             | Rate limiting, sessions         |
| **Deploy**        | Vercel (web) + Railway (API) | Zero-config, escalable          |

---

## Base de datos (Prisma Schema)

### Entidades principales

```
Church (tenant)
  └── Membership[] → User
  └── Song[]
  │     └── SongVersion[] (ORIGINAL, MALE_KEY, FEMALE_KEY, CUSTOM)
  └── Meeting[]
  │     └── MeetingSong[] → Song
  │     └── Assignment[] → User + Instrument
  └── Instrument[]
  └── Subscription (plan, status, Stripe IDs)
```

### Índices estratégicos

- `songs(churchId, title)` — búsqueda full-text por iglesia
- `meetings(churchId, date)` — filtro de próximas reuniones
- `memberships(churchId)` — listado de miembros por iglesia
- `refresh_tokens(userId)` — rotación de tokens

---

## Autenticación y roles

```
ADMIN   → Gestiona iglesia, suscripción, usuarios, instrumentos
EDITOR  → Crea/edita canciones y reuniones, asigna músicos
READER  → Solo lectura (ver lista, ver acordes, transponer)
```

**Flujo de tokens:**

```
Login → { accessToken (15min), refreshToken (7 días) }
         ↓
    accessToken en cookies (HttpOnly, Secure)
    refreshToken en cookies (HttpOnly, Secure)
         ↓
    axios interceptor → auto-refresh cuando 401
    refresh → rotación del refreshToken (uno a uno)
```

---

## API Endpoints

### Auth

| Método | Ruta                         | Descripción                    |
| ------ | ---------------------------- | ------------------------------ |
| POST   | `/api/v1/auth/register`      | Registro + iglesia + plan FREE |
| POST   | `/api/v1/auth/login`         | Login                          |
| POST   | `/api/v1/auth/refresh`       | Renovar access token           |
| POST   | `/api/v1/auth/logout`        | Invalidar refresh token        |
| POST   | `/api/v1/auth/switch-church` | Cambiar tenant activo          |

### Iglesias

| Método | Ruta                          | Rol mínimo |
| ------ | ----------------------------- | ---------- |
| GET    | `/api/v1/churches/me`         | READER     |
| PATCH  | `/api/v1/churches/me`         | ADMIN      |
| GET    | `/api/v1/churches/me/stats`   | READER     |
| GET    | `/api/v1/churches/me/members` | READER     |
| POST   | `/api/v1/churches/me/members` | ADMIN      |

### Canciones

| Método | Ruta                                 | Rol mínimo |
| ------ | ------------------------------------ | ---------- |
| GET    | `/api/v1/songs`                      | READER     |
| POST   | `/api/v1/songs`                      | EDITOR     |
| GET    | `/api/v1/songs/:id`                  | READER     |
| PATCH  | `/api/v1/songs/:id`                  | EDITOR     |
| DELETE | `/api/v1/songs/:id`                  | EDITOR     |
| POST   | `/api/v1/songs/:id/versions`         | EDITOR     |
| GET    | `/api/v1/songs/:id/transpose?key=F#` | READER     |

### Reuniones

| Método | Ruta                                 | Descripción                    |
| ------ | ------------------------------------ | ------------------------------ |
| GET    | `/api/v1/meetings`                   | Listar                         |
| POST   | `/api/v1/meetings`                   | Crear                          |
| PATCH  | `/api/v1/meetings/:id/songs/reorder` | Drag & Drop                    |
| POST   | `/api/v1/meetings/:id/share`         | Generar link público           |
| GET    | `/api/v1/public/meetings/:token`     | Ver sin auth (link compartido) |

---

## Feature: Transposición de acordes

### Formato de entrada (ChordPro)

```
[C]Amazing [G]grace how [Am]sweet the [F]sound
That [C]saved a [G]wretch like [C]me
```

### Algoritmo

```
C → C# → D → D# → E → F → F# → G → G# → A → A# → B → C
0    1    2    3    4   5    6    7    8    9   10   11
```

1. Parsear acordes en `[...]`
2. Extraer nota raíz + calidad + nota de bajo
3. Calcular `semitones = targetIndex - sourceIndex (mod 12)`
4. Desplazar nota raíz y nota de bajo
5. Reconstruir acorde
6. Preferencia de bemoles automática según tonalidad destino (F, Bb, Eb, Ab...)

**Ejemplos:**

```
C  → D  (+2)   ✓
F#m → G#m (+2) ✓
Am/G → Bm/A (+2) ✓
Cmaj7 → Dmaj7 (+2) ✓
Bb → C (+2) ✓
```

### Dónde ocurre

| Lugar                        | Descripción                                            |
| ---------------------------- | ------------------------------------------------------ |
| `TranspositionService` (API) | Guardar versiones transpuestas en BD                   |
| `lib/transposition.ts` (Web) | Transposición **instantánea** en el cliente para la UI |
| `useTransposition` hook      | Estado reactivo en el componente de canción            |
| `TranspositionControl`       | Selector visual de 12 tonalidades                      |
| `ChordSheet`                 | Renderiza acordes + letra con acordes resaltados       |

---

## Modelo de negocio (Planes)

| Feature                     | FREE      | PRO ($9.99/mes) | ENTERPRISE ($29.99/mes) |
| --------------------------- | --------- | --------------- | ----------------------- |
| Usuarios                    | 5         | Ilimitados      | Ilimitados              |
| Canciones                   | 50        | Ilimitadas      | Ilimitadas              |
| Instrumentos personalizados | 6         | 30              | Ilimitados              |
| Historial                   | 3 meses   | Ilimitado       | Ilimitado               |
| Export PDF                  | ✗         | ✓               | ✓                       |
| Links compartidos           | ✓         | ✓               | ✓                       |
| Multi-equipos               | ✗         | ✗               | ✓                       |
| Soporte                     | Community | Email           | Prioridad               |
| Trial                       | —         | 14 días gratis  | 14 días gratis          |

### Integración Stripe

```
Checkout → stripe.checkout.sessions.create(priceId)
        → redirect al portal de Stripe
        → webhook: checkout.session.completed
        → actualizar Subscription en BD
        → plan activo ✓
```

---

## Setup local

### Prerequisitos

- Node.js 20+
- PostgreSQL 15+
- (opcional) Redis

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
# Editar con tus valores

# 3. Generar cliente Prisma y migrar BD
npm run db:migrate

# 4. Iniciar en modo desarrollo
npm run dev
# API: http://localhost:3001
# Web: http://localhost:3000
# Docs: http://localhost:3001/docs
```

---

## Estrategia de escalado

### Nivel 1: Vertical (0–1000 iglesias)

- Single PostgreSQL instance con connection pooling (PgBouncer)
- Redis para caché de canciones y rate limiting
- CDN para assets estáticos

### Nivel 2: Horizontal (1000–10000 iglesias)

- Read replicas para queries pesadas
- Redis cluster para sesiones distribuidas
- API stateless → múltiples instancias detrás de load balancer
- Índices compuestos por `churchId` en todas las tablas

### Nivel 3: Sharding (10000+ iglesias)

- Sharding por `churchId` si necesario
- Row-Level Security (RLS) de PostgreSQL como capa adicional
- Separar base de datos de analytics (ClickHouse)
- Mensajería asíncrona (BullMQ) para exports PDF y notificaciones

### Seguridad por capas

1. **HTTPS forzado** en todos los entornos
2. **Rate limiting** (ThrottlerGuard): 100 req/min por IP
3. **JWT seguro**: access token de 15 min, refresh rotación obligatoria
4. **Aislamiento tenant**: `churchId` validado en CADA query
5. **Validación de inputs**: class-validator + Zod en frontend
6. **CORS**: solo el dominio del frontend
7. **Stripe webhook**: firma verificada antes de procesar
8. **Contraseñas**: bcrypt con salt 12

---

## Roadmap sugerido

### v1.0 (MVP)

- [x] Auth + multi-tenancy
- [x] CRUD canciones + acordes + transposición
- [x] Reuniones + asignaciones de músicos
- [x] Plan Free + Pro (Stripe)

### v1.1

- [ ] Export PDF de lista de canciones
- [ ] Notificaciones por email (próximas reuniones)
- [ ] Modo oscuro

### v1.2

- [ ] App móvil (React Native / Expo)
- [ ] Modo offline básico (Service Worker + IndexedDB)
- [ ] Importar canciones desde URL (Ultimate Guitar,等)

### v2.0

- [ ] Multi-equipos dentro de una iglesia
- [ ] Historial de cambios de canciones
- [ ] Analytics avanzados (Top canciones, músicos activos)
- [ ] Integración con ProPresenter / EasyWorship
