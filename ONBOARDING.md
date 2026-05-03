# Onboarding para desarrolladores SongList

¡Bienvenido/a al equipo SongList! Sigue esta guía para levantar el entorno local, entender la arquitectura y contribuir de forma efectiva.

---

## 1. Requisitos previos

- Node.js 20+
- PostgreSQL 15+
- (Opcional) Redis para caché y rate limiting

## 2. Instalación rápida

```bash
# Clona el repo
 git clone <repo-url>
 cd SongList

# Instala dependencias
 npm install

# Copia y edita variables de entorno
 cp .env.example apps/api/.env
 cp .env.example apps/web/.env.local
 # Edita los valores según tu entorno

# Migra la base de datos y genera Prisma Client
 npm run db:migrate

# Inicia ambos servicios en modo desarrollo
 npm run dev
# API: http://localhost:3001
# Web: http://localhost:3000
```

## 3. Estructura del monorepo

- `apps/api/` — Backend NestJS (multi-tenant, roles, Stripe, Prisma)
- `apps/web/` — Frontend Next.js 14 (App Router, React Query, Zod, Tailwind)
- `packages/shared/` — Tipos y utilidades compartidas

## 4. Flujos clave

- **Invitación de usuarios:** El admin invita por link, el usuario debe registrarse usando ese link para unirse al equipo.
- **Canciones:** CRUD, transposición, versiones.
- **Reuniones:** Crear, asignar músicos, compartir por link público.
- **Planes:** Stripe/MercadoPago, upgrade/downgrade desde settings.

## 5. Comandos útiles

- `npm run lint` — Lint de todo el monorepo
- `npm run test` — Tests de todo el monorepo
- `npm run build` — Build de producción
- `npm run db:migrate` — Migrar base de datos
- `npm run demo:seed` — Cargar datos demo
- `npm run beta:check` — Validación rápida pre-release

## 6. Troubleshooting

- **Error de conexión a DB:** Revisa variables en `.env` y que PostgreSQL esté corriendo.
- **Problemas de CORS:** Verifica `API_URL` y `FRONTEND_URL` en ambos `.env`.
- **Stripe/MercadoPago:** Usa claves de test en local.
- **No se ven canciones/reuniones:** Asegúrate de tener el `churchId` correcto en el JWT.

## 7. Recursos y documentación

- [README.md](./README.md) — Arquitectura, endpoints, stack
- [QUALITY_CHECKLIST.md](./QUALITY_CHECKLIST.md) — Checklist de calidad
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) — Checklist de release
- [DEPLOY_ENV.md](./DEPLOY_ENV.md) — Variables de entorno
- [BETA_LAUNCH.md](./BETA_LAUNCH.md) — Guía de lanzamiento beta

---

¡Cualquier duda, pregunta en el canal #devs o revisa los archivos de checklist/documentación!
