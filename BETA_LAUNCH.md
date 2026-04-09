# Beta Launch Rapido

Objetivo: mostrar SongList a personas reales esta misma semana con un entorno estable y una demo clara.

## 1) Preparar datos de demo

Ejecutar una sola vez:

npm run demo:seed

Credenciales por defecto creadas por el seed:

- Email: demo@songlist.app
- Password: SongListDemo123!
- Iglesia demo: demo-songlist

Puedes personalizar con variables de entorno antes de correr:

- DEMO_ADMIN_EMAIL
- DEMO_ADMIN_PASSWORD
- DEMO_CHURCH_SLUG

## 2) Publicar entorno beta (recomendado)

Arquitectura recomendada:

- Web: Vercel
- API + Postgres: Railway (o Render/Fly)

### API (Railway)

Configurar el servicio apuntando al repo raiz con el archivo `railway.json` ya incluido.

Variables minimas:

- DATABASE_URL
- JWT_SECRET
- REFRESH_TOKEN_SECRET
- FRONTEND_URL
- API_URL
- NODE_ENV=production
- STRIPE_SECRET_KEY (si activas pagos)
- STRIPE_WEBHOOK_SECRET (si activas pagos)
- STRIPE_PRICE_PRO_MONTHLY (si activas pagos)
- STRIPE_PRICE_ENTERPRISE_MONTHLY (si activas pagos)

Comandos sugeridos:

- Build: npm run build --workspace=@songlist/api
- Start: npm run start --workspace=@songlist/api

Luego correr migraciones en el servicio API:

- npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
- npm run demo:seed

### Web (Vercel)

Crear proyecto nuevo en Vercel usando este repo y configurar:

- Root Directory: apps/web
- Framework Preset: Next.js

Variables minimas:

- API_BASE_URL=https://tu-api.com
- NEXT_PUBLIC_APP_URL=https://tu-web.com

Nota:

- `API_BASE_URL` se usa en el proxy de Next.js (server-side rewrite).
- `NEXT_PUBLIC_API_URL` queda opcional para compatibilidad local.

Build command:

- npm run build --workspace=@songlist/web

Si Vercel usa el Root Directory `apps/web`, puedes dejar el build command por defecto.

Comandos CLI (desde la raiz del repo):

- npm run vercel:link:web
- npm run vercel:deploy:web
- npm run vercel:deploy:web:prod

## 3) Checklist de salida a beta

- Login y registro funcionan en URL publica.
- Crear cancion funciona.
- Ver detalle y transponer funciona.
- Crear reunion y ordenar canciones funciona.
- Enlace publico de reunion funciona.
- CI en verde en main.
- Seed demo ejecutado en la base publica.

## 4) Como venderla antes de terminar

Propuesta simple para demos:

- Mensaje: centraliza canciones, transposicion y planificacion de reuniones en una sola app.
- Demo de 10 minutos con flujo real:
  1. Login
  2. Alta de cancion
  3. Transposicion en vivo
  4. Crear reunion y asignar canciones
  5. Compartir reunion por enlace

## 5) Limites conocidos en beta

- Pagos pueden quedar en modo test mientras validas interes.
- Algunas funciones enterprise pueden presentarse como roadmap cercano.
- Mantener una sola iglesia demo limpia para presentaciones.
