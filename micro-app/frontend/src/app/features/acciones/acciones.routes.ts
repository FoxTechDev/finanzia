import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';
import { roleGuard } from '../../core/guards/role.guard';
import { RoleCodes } from '../../core/models/user.model';

export const ACCIONES_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/acciones/acciones-list.component').then(
            (m) => m.AccionesListComponent,
          ),
        title: 'Acciones',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE] },
      },
      {
        path: 'tipos-accion',
        loadComponent: () =>
          import('./components/catalogos/tipos-accion/tipos-accion.component').then(
            (m) => m.TiposAccionComponent,
          ),
        title: 'Tipos de Acción',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN] },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/acciones/accion-detail.component').then(
            (m) => m.AccionDetailComponent,
          ),
        title: 'Detalle de Acción',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE] },
      },
    ],
  },
];
