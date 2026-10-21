import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'

/**
 * Allows only the platform owner. The flag is read from the database on every
 * request (via JwtStrategy), never trusted from the token.
 */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    if (request.user?.isPlatformAdmin === true) return true
    throw new ForbiddenException('Solo el administrador de la plataforma puede hacer esto')
  }
}
