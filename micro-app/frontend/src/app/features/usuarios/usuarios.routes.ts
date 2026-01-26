import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/usuarios-list/usuarios-list.component').then(
            (m) => m.UsuariosListComponent
          ),
      },
    ],
  },
];
