import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleCodes } from '../enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleCodes[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Si no hay usuario o no tiene rol, denegar acceso
    if (!user || !user.rol) {
      return false;
    }

    const userRoleCode = user.rol.codigo;

    // ADMIN siempre tiene acceso completo
    if (userRoleCode === RoleCodes.ADMIN) {
      return true;
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    return requiredRoles.includes(userRoleCode);
  }
}
