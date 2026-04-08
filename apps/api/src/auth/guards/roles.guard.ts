import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MemberRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Jerarquía de roles: un rol superior puede hacer todo lo que el inferior
const ROLE_HIERARCHY: Record<MemberRole, number> = {
  [MemberRole.ADMIN]: 3,
  [MemberRole.EDITOR]: 2,
  [MemberRole.READER]: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const userRole: MemberRole = request.user?.currentRole;

    if (!userRole) {
      throw new ForbiddenException('No tienes un rol asignado en esta iglesia');
    }

    const hasRole = requiredRoles.some(
      (required) => ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required],
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere rol: ${requiredRoles.join(' o ')}`,
      );
    }

    return true;
  }
}
