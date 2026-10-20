# Release Checklist

Objetivo: publicar SongList a entorno beta con una secuencia repetible y segura.

Referencia corta de variables por plataforma: ver `DEPLOY_ENV.md`.

## 1) Verificacion previa en local

1. Ejecutar validacion rapida:

   npm run beta:check

2. Ejecutar validacion completa:

   npm run beta:check:full

3. Verificar arbol limpio antes de desplegar:

   git status

Esperado: sin cambios pendientes y `beta:check:full` en PASS.

## 2) API en Railway

1. Configurar servicio con root del repo.
2. Build command:

   npm run build --workspace=@songlist/api

3. Start command:

   npm run start --workspace=@songlist/api

4. Variables requeridas:

   DATABASE_URL
   JWT_SECRET
   REFRESH_TOKEN_SECRET
   FRONTEND_URL
   API_URL
   NODE_ENV=production

   Ejemplo:

   FRONTEND_URL=https://tu-web.vercel.app
   API_URL=https://tu-api.up.railway.app

5. Aplicar migraciones:

   npx prisma migrate deploy --schema apps/api/prisma/schema.prisma

6. Cargar demo seed (opcional para demos):

   npm run demo:seed

## 3) Web en Vercel

1. Root directory: apps/web
2. Variables requeridas:

   API_BASE_URL=https://TU_API_PUBLICA
   NEXT_PUBLIC_APP_URL=https://TU_WEB_PUBLICA

   Opcional:

   NEXT_PUBLIC_API_URL=https://TU_API_PUBLICA

3. Deploy por CLI (opcional):

   npm run vercel:link:web
   npm run vercel:deploy:web
   npm run vercel:deploy:web:prod

## 4) Smoke test en produccion

0. API health:
   - GET https://TU_API_PUBLICA/health
   - Esperado: JSON con `status: ok`

1. Registro/Login
2. Crear cancion
3. Ver detalle + transposicion
4. Crear reunion + agregar canciones + reorder
5. Compartir reunion por enlace (segun plan)
6. Ver URL publica de reunion

URLs utiles:

- Web login: https://TU_WEB_PUBLICA/login
- Web songs: https://TU_WEB_PUBLICA/songs
- Web meetings: https://TU_WEB_PUBLICA/meetings

## 5) Rollback rapido

1. API: redeploy a version anterior estable en Railway.
2. Web: promover deploy previo en Vercel.
3. Confirmar salud minima:
   - Login responde
   - Listado de canciones carga
   - Reuniones cargan

## 6) Criterio de salida

La release queda aprobada cuando:

- `npm run beta:check:full` pasa.
- Deploy API y Web completados.
- Smoke test de produccion validado.
