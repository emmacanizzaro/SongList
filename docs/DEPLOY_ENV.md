# Deploy Env Cheat Sheet

Objetivo: tener una referencia corta y copiable para publicar SongList sin revisar multiples archivos.

## Railway API

Variables obligatorias:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/songlist_db?schema=public
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-chars
REFRESH_TOKEN_SECRET=replace-with-a-different-long-random-secret-at-least-32-chars
FRONTEND_URL=https://tu-web.vercel.app
API_URL=https://tu-api.up.railway.app
NODE_ENV=production
```

Variables opcionales para pagos:

```env
STRIPE_SECRET_KEY=sk_live_or_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
```

Checks rapidos:

- Health: `https://tu-api.up.railway.app/health`
- Esperado: `{"status":"ok"}`

## Vercel Web

Variables obligatorias:

```env
API_BASE_URL=https://tu-api.up.railway.app
NEXT_PUBLIC_APP_URL=https://tu-web.vercel.app
```

Variable opcional:

```env
NEXT_PUBLIC_API_URL=https://tu-api.up.railway.app
```

Checks rapidos:

- Login: `https://tu-web.vercel.app/login`
- Songs: `https://tu-web.vercel.app/songs`
- Meetings: `https://tu-web.vercel.app/meetings`

## Orden recomendado

1. Crear base Postgres y configurar `DATABASE_URL` en Railway.
2. Configurar variables de API y desplegar Railway.
3. Confirmar `GET /health`.
4. Configurar variables de Web y desplegar Vercel.
5. Ejecutar smoke test de login, canciones y reuniones.

## Notas

- `API_BASE_URL` es la variable clave para el rewrite del frontend en produccion.
- `NEXT_PUBLIC_API_URL` no es obligatoria si `API_BASE_URL` ya esta definida.
- Usa secretos distintos para `JWT_SECRET` y `REFRESH_TOKEN_SECRET`.
