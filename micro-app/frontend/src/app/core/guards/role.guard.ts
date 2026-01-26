import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleCodes } from '../models/user.model';

/**
 * Guard para verificar roles de usuario
 *
 * Uso en rutas:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: [RoleCodes.ADMIN] }
 * }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar autenticación primero
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Obtener roles requeridos de la ruta
  const requiredRoles = route.data['roles'] as RoleCodes[] | undefined;

  // Si no hay roles requeridos, permitir acceso
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Verificar si el usuario tiene alguno de los roles requeridos
  if (authService.hasRole(...requiredRoles)) {
    return true;
  }

  // Usuario no tiene permisos, redirigir a home
  console.warn('Acceso denegado: El usuario no tiene los roles requeridos', requiredRoles);
  router.navigate(['/home']);
  return false;
};
