import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';
import { roleGuard } from '../../core/guards/role.guard';
import { RoleCodes } from '../../core/models/user.model';

export const AHORROS_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'vista', pathMatch: 'full' },
      { path: 'cuentas', redirectTo: 'vista', pathMatch: 'full' },
      // Ahorro a la Vista
      {
        path: 'vista',
        loadComponent: () =>
          import('./components/cuentas/cuentas-list.component').then(
            (m) => m.CuentasListComponent,
          ),
        title: 'Ahorro a la Vista',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE], lineaCodigo: 'AV', lineaNombre: 'Ahorro a la Vista' },
      },
      {
        path: 'vista/:id',
        loadComponent: () =>
          import('./components/cuentas/cuenta-detail.component').then(
            (m) => m.CuentaDetailComponent,
          ),
        title: 'Detalle - Ahorro a la Vista',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE], lineaCodigo: 'AV', lineaNombre: 'Ahorro a la Vista' },
      },
      // Depósito a Plazo Fijo
      {
        path: 'plazo',
        loadComponent: () =>
          import('./components/cuentas/cuentas-list.component').then(
            (m) => m.CuentasListComponent,
          ),
        title: 'Depósito a Plazo Fijo',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE], lineaCodigo: 'DPF', lineaNombre: 'Depósito a Plazo Fijo' },
      },
      {
        path: 'plazo/:id',
        loadComponent: () =>
          import('./components/cuentas/cuenta-detail.component').then(
            (m) => m.CuentaDetailComponent,
          ),
        title: 'Detalle - Depósito a Plazo Fijo',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE], lineaCodigo: 'DPF', lineaNombre: 'Depósito a Plazo Fijo' },
      },
      // Ahorro Programado
      {
        path: 'programado',
        loadComponent: () =>
          import('./components/cuentas/cuentas-list.component').then(
            (m) => m.CuentasListComponent,
          ),
        title: 'Ahorro Programado',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE], lineaCodigo: 'AP', lineaNombre: 'Ahorro Programado' },
      },
      {
        path: 'programado/:id',
        loadComponent: () =>
          import('./components/cuentas/cuenta-detail.component').then(
            (m) => m.CuentaDetailComponent,
          ),
        title: 'Detalle - Ahorro Programado',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE], lineaCodigo: 'AP', lineaNombre: 'Ahorro Programado' },
      },
      // Provisión de intereses
      {
        path: 'provision',
        loadComponent: () =>
          import('./components/provision/provision-intereses.component').then(
            (m) => m.ProvisionInteresesComponent,
          ),
        title: 'Provisión de Intereses',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE] },
      },
      // Reportes
      {
        path: 'reportes/apertura',
        loadComponent: () =>
          import('./components/reportes/reporte-apertura.component').then(
            (m) => m.ReporteAperturaComponent,
          ),
        title: 'Reporte de Apertura',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE] },
      },
      {
        path: 'reportes/intereses',
        loadComponent: () =>
          import('./components/reportes/reporte-intereses.component').then(
            (m) => m.ReporteInteresesComponent,
          ),
        title: 'Intereses a Pagar',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE] },
      },
      {
        path: 'lineas',
        loadComponent: () =>
          import(
            './components/catalogos/lineas-ahorro/lineas-ahorro.component'
          ).then((m) => m.LineasAhorroComponent),
        title: 'Líneas de Ahorro',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN] },
      },
      {
        path: 'tipos',
        loadComponent: () =>
          import(
            './components/catalogos/tipos-ahorro/tipos-ahorro.component'
          ).then((m) => m.TiposAhorroComponent),
        title: 'Tipos de Ahorro',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN] },
      },
      {
        path: 'estados-cuenta',
        loadComponent: () =>
          import(
            './components/catalogos/estados-cuenta/estados-cuenta.component'
          ).then((m) => m.EstadosCuentaComponent),
        title: 'Estados de Cuenta',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN] },
      },
      {
        path: 'tipos-capitalizacion',
        loadComponent: () =>
          import(
            './components/catalogos/tipos-capitalizacion/tipos-capitalizacion.component'
          ).then((m) => m.TiposCapitalizacionComponent),
        title: 'Tipos de Capitalización',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN] },
      },
      {
        path: 'naturalezas-movimiento',
        loadComponent: () =>
          import(
            './components/catalogos/naturalezas-movimiento/naturalezas-movimiento.component'
          ).then((m) => m.NaturalezasMovimientoComponent),
        title: 'Naturaleza de Movimiento',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN] },
      },
      {
        path: 'tipos-transaccion',
        loadComponent: () =>
          import(
            './components/catalogos/tipos-transaccion/tipos-transaccion.component'
          ).then((m) => m.TiposTransaccionComponent),
        title: 'Tipos de Transacción',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN] },
      },
      {
        path: 'bancos',
        loadComponent: () =>
          import('./components/catalogos/bancos/bancos.component').then(
            (m) => m.BancosComponent,
          ),
        title: 'Bancos',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN] },
      },
    ],
  },
];
