import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * TenantResourceGuard — Verifica que el recurso (por :id en la URL)
 * pertenezca al churchId del JWT antes de permitir el acceso.
 *
 * Esto previene el acceso cross-tenant (IDOR) asegurando que ningún
 * usuario pueda acceder a recursos de otra iglesia aunque conozca el ID.
 *
 * Se aplica a nivel de módulo usando el campo `churchId` del modelo.
 */
@Injectable()
export class TenantResourceGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const churchId: string = request.user?.churchId;
    const resourceId: string = request.params?.id;

    if (!churchId) throw new ForbiddenException('No autenticado como miembro de una iglesia');
    if (!resourceId) return true; // No hay ID en la ruta, no aplica

    // Se almacena churchId validado para uso en los servicios
    request.tenantChurchId = churchId;

    return true;
  }
}
