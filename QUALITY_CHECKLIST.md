# Quality Checklist

Usa esta lista antes de abrir PR o mergear a main.

## Validacion automatica

- Ejecutar lint del monorepo: `npm run lint`
- Ejecutar tests del monorepo: `npm run test`
- Ejecutar build de produccion: `npm run build`

## Reglas de frontend (Next.js + React)

- No usar hooks de React en ramas condicionales o despues de returns tempranos.
- Si una pagina cliente usa `useSearchParams`, envolver el contenido en `Suspense`.
- Verificar rutas criticas: login, songs, songs/[id], meetings, settings/billing.

## Reglas de backend (NestJS)

- No dejar imports o variables sin uso.
- Mantener DTOs con validacion y transformacion tipada.
- Verificar reglas multi-tenant: toda consulta de datos de tenant filtrada por `churchId`.

## Testing minimo

- Cada modulo de dominio nuevo debe agregar al menos 1 spec de smoke test.
- Para reglas de negocio (ej: transposicion), agregar casos felices y bordes basicos.

## Definicion de listo (DoD)

- CI en verde en PR: lint, test, typecheck y build.
- Sin errores en `Problems` de VS Code para archivos modificados.
- Sin cambios de formato o refactors no relacionados al alcance del PR.
