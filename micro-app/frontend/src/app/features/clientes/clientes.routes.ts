import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/cliente-list/cliente-list.component').then(
            (m) => m.ClienteListComponent
          ),
      },
      {
        path: 'nuevo',
        loadComponent: () =>
          import('./components/cliente-form/cliente-form.component').then(
            (m) => m.ClienteFormComponent
          ),
      },
      {
        path: 'editar/:id',
        loadComponent: () =>
          import('./components/cliente-form/cliente-form.component').then(
            (m) => m.ClienteFormComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/cliente-detail/cliente-detail.component').then(
            (m) => m.ClienteDetailComponent
          ),
      },
    ],
  },
];
