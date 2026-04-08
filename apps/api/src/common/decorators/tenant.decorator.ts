import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentTenant() — Extrae el churchId del JWT del usuario autenticado.
 * Todos los endpoints multi-tenant deben usar este decorador para
 * garantizar el aislamiento de datos entre iglesias.
 *
 * Uso: @CurrentTenant() churchId: string
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.churchId;
  },
);
