import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';

export const CATALOGOS_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'departamentos',
        pathMatch: 'full',
      },
      // Catálogos geográficos existentes
      {
        path: 'departamentos',
        loadComponent: () =>
          import('./components/departamentos/departamentos.component').then(
            (m) => m.DepartamentosComponent
          ),
      },
      {
        path: 'municipios',
        loadComponent: () =>
          import('./components/municipios/municipios.component').then(
            (m) => m.MunicipiosComponent
          ),
      },
      {
        path: 'distritos',
        loadComponent: () =>
          import('./components/distritos/distritos.component').then(
            (m) => m.DistritosComponent
          ),
      },
      // Nuevos catálogos del sistema
      {
        path: 'estado-garantia',
        loadComponent: () =>
          import('./components/estado-garantia/estado-garantia.component').then(
            (m) => m.EstadoGarantiaComponent
          ),
      },
      {
        path: 'recomendacion-asesor',
        loadComponent: () =>
          import('./components/recomendacion-asesor/recomendacion-asesor.component').then(
            (m) => m.RecomendacionAsesorComponent
          ),
      },
      {
        path: 'tipo-decision-comite',
        loadComponent: () =>
          import('./components/tipo-decision-comite/tipo-decision-comite.component').then(
            (m) => m.TipoDecisionComiteComponent
          ),
      },
      {
        path: 'tipo-pago',
        loadComponent: () =>
          import('./components/tipo-pago/tipo-pago.component').then(
            (m) => m.TipoPagoComponent
          ),
      },
      {
        path: 'estado-pago',
        loadComponent: () =>
          import('./components/estado-pago/estado-pago.component').then(
            (m) => m.EstadoPagoComponent
          ),
      },
      {
        path: 'sexo',
        loadComponent: () =>
          import('./components/sexo/sexo.component').then(
            (m) => m.SexoComponent
          ),
      },
      {
        path: 'estado-solicitud',
        loadComponent: () =>
          import('./components/estado-solicitud/estado-solicitud.component').then(
            (m) => m.EstadoSolicitudComponent
          ),
      },
      {
        path: 'destino-credito',
        loadComponent: () =>
          import('./components/destino-credito/destino-credito.component').then(
            (m) => m.DestinoCreditoComponent
          ),
      },
      {
        path: 'estado-cuota',
        loadComponent: () =>
          import('./components/estado-cuota/estado-cuota.component').then(
            (m) => m.EstadoCuotaComponent
          ),
      },
      {
        path: 'tipo-interes',
        loadComponent: () =>
          import('./components/tipo-interes/tipo-interes.component').then(
            (m) => m.TipoInteresComponent
          ),
      },
      {
        path: 'periodicidad-pago',
        loadComponent: () =>
          import('./components/periodicidad-pago/periodicidad-pago.component').then(
            (m) => m.PeriodicidadPagoComponent
          ),
      },
      {
        path: 'estado-prestamo',
        loadComponent: () =>
          import('./components/estado-prestamo/estado-prestamo.component').then(
            (m) => m.EstadoPrestamoComponent
          ),
      },
      {
        path: 'categoria-ncb022',
        loadComponent: () =>
          import('./components/categoria-ncb022/categoria-ncb022.component').then(
            (m) => m.CategoriaNcb022Component
          ),
      },
      {
        path: 'tipo-calculo',
        loadComponent: () =>
          import('./components/tipo-calculo/tipo-calculo.component').then(
            (m) => m.TipoCalculoComponent
          ),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./components/roles/roles.component').then(
            (m) => m.RolesComponent
          ),
      },
    ],
  },
];
