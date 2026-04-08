import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Servicio base para acceso a recursos multi-tenant.
 * Cualquier servicio que gestione recursos de una iglesia debe
 * usar estos métodos para garantizar el aislamiento de datos.
 */
@Injectable()
export class TenantBaseService {
  constructor(protected readonly prisma: PrismaService) {}

  /**
   * Verifica que un recurso pertenezca al churchId del token.
   * Lanza NotFoundException si no existe, ForbiddenException si no pertenece.
   */
  protected async assertBelongsToTenant<T extends { churchId: string }>(
    resource: T | null,
    churchId: string,
    resourceName = 'Recurso',
  ): Promise<T> {
    if (!resource) throw new NotFoundException(`${resourceName} no encontrado`);
    if (resource.churchId !== churchId) {
      throw new ForbiddenException('No tienes acceso a este recurso');
    }
    return resource;
  }
}
