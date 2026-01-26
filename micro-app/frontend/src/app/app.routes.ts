import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { RoleCodes } from './core/models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'clientes',
    loadChildren: () =>
      import('./features/clientes/clientes.routes').then((m) => m.CLIENTES_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE] },
  },
  {
    path: 'catalogos',
    loadChildren: () =>
      import('./features/catalogos/catalogos.routes').then((m) => m.CATALOGOS_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleCodes.ADMIN] },
  },
  {
    path: 'creditos',
    loadChildren: () =>
      import('./features/creditos/creditos.routes').then((m) => m.CREDITOS_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'usuarios',
    loadChildren: () =>
      import('./features/usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: [RoleCodes.ADMIN] },
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
