import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';
import { roleGuard } from '../../core/guards/role.guard';
import { RoleCodes } from '../../core/models/user.model';

export const CREDITOS_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'solicitudes',
        pathMatch: 'full',
      },
      {
        path: 'lineas',
        loadComponent: () =>
          import('./components/lineas-credito/lineas-credito.component').then(
            (m) => m.LineasCreditoComponent
          ),
        title: 'Líneas de Crédito',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN] },
      },
      {
        path: 'tipos',
        loadComponent: () =>
          import('./components/tipos-credito/tipos-credito.component').then(
            (m) => m.TiposCreditoComponent
          ),
        title: 'Tipos de Crédito',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN] },
      },
      {
        path: 'solicitudes',
        loadComponent: () =>
          import('./components/solicitudes/solicitudes-list.component').then(
            (m) => m.SolicitudesListComponent
          ),
        title: 'Solicitudes de Crédito',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE] },
      },
      {
        path: 'solicitudes/nueva',
        loadComponent: () =>
          import('./components/solicitudes/solicitud-form.component').then(
            (m) => m.SolicitudFormComponent
          ),
        title: 'Nueva Solicitud',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE] },
      },
      {
        path: 'solicitudes/:id',
        loadComponent: () =>
          import('./components/solicitudes/solicitud-detail.component').then(
            (m) => m.SolicitudDetailComponent
          ),
        title: 'Detalle de Solicitud',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE] },
      },
      {
        path: 'solicitudes/:id/editar',
        loadComponent: () =>
          import('./components/solicitudes/solicitud-form.component').then(
            (m) => m.SolicitudFormComponent
          ),
        title: 'Editar Solicitud',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE] },
      },
      {
        path: 'catalogos-garantia',
        loadComponent: () =>
          import('./components/catalogos-garantia/catalogos-garantia.component').then(
            (m) => m.CatalogosGarantiaComponent
          ),
        title: 'Catálogos de Garantías',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN] },
      },
      {
        path: 'comite',
        loadComponent: () =>
          import('./components/comite/bandeja-comite/bandeja-comite.component').then(
            (m) => m.BandejaComiteComponent
          ),
        title: 'Comité de Crédito',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE] },
      },
      {
        path: 'desembolso',
        loadComponent: () =>
          import('./components/desembolso/bandeja-desembolso/bandeja-desembolso.component').then(
            (m) => m.BandejaDesembolsoComponent
          ),
        title: 'Desembolso de Créditos',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE] },
      },
      {
        path: 'prestamos',
        loadComponent: () =>
          import('./components/prestamos/prestamos-list.component').then(
            (m) => m.PrestamosListComponent
          ),
        title: 'Préstamos',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE] },
      },
      {
        path: 'prestamos/:id',
        loadComponent: () =>
          import('./components/prestamos/prestamo-detail.component').then(
            (m) => m.PrestamoDetailComponent
          ),
        title: 'Detalle de Préstamo',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE] },
      },
      {
        path: 'prestamos/:id/pagos',
        loadComponent: () =>
          import('./components/pagos/historial-pagos/historial-pagos.component').then(
            (m) => m.HistorialPagosComponent
          ),
        title: 'Historial de Pagos',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE] },
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./components/pagos/pagos-list/pagos-list.component').then(
            (m) => m.PagosListComponent
          ),
        title: 'Consulta de Pagos',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE] },
      },
      {
        path: 'pagos/:id/recibo',
        loadComponent: () =>
          import('./components/pagos/recibo-pago/recibo-pago.component').then(
            (m) => m.ReciboPagoComponent
          ),
        title: 'Recibo de Pago',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE] },
      },
      {
        path: 'clasificacion-prestamos',
        loadComponent: () =>
          import('./components/clasificacion-prestamo/clasificacion-prestamo.component').then(
            (m) => m.ClasificacionPrestamoComponent
          ),
        title: 'Clasificación de Préstamos',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN] },
      },
      {
        path: 'reportes/colocacion',
        loadComponent: () =>
          import('./components/reportes/reporte-colocacion.component').then(
            (m) => m.ReporteColocacionComponent
          ),
        title: 'Reporte de Colocación',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.ASESOR, RoleCodes.COMITE] },
      },
      {
        path: 'reportes/pagos',
        loadComponent: () =>
          import('./components/reportes/reporte-pagos.component').then(
            (m) => m.ReportePagosComponent
          ),
        title: 'Reporte de Pagos',
        canActivate: [roleGuard],
        data: { roles: [RoleCodes.ADMIN, RoleCodes.COMITE] },
      },
    ],
  },
];
