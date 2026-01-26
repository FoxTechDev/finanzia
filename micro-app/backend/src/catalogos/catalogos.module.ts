import { Module } from '@nestjs/common';
import { EstadoGarantiaModule } from './estado-garantia/estado-garantia.module';
import { RecomendacionAsesorModule } from './recomendacion-asesor/recomendacion-asesor.module';
import { TipoDecisionComiteModule } from './tipo-decision-comite/tipo-decision-comite.module';
import { TipoPagoModule } from './tipo-pago/tipo-pago.module';
import { EstadoPagoModule } from './estado-pago/estado-pago.module';
import { SexoModule } from './sexo/sexo.module';
import { EstadoSolicitudModule } from './estado-solicitud/estado-solicitud.module';
import { DestinoCreditoModule } from './destino-credito/destino-credito.module';
import { EstadoCuotaModule } from './estado-cuota/estado-cuota.module';
import { TipoInteresModule } from './tipo-interes/tipo-interes.module';
import { PeriodicidadPagoModule } from './periodicidad-pago/periodicidad-pago.module';
import { TipoCalculoModule } from './tipo-calculo/tipo-calculo.module';
import { RolModule } from './rol/rol.module';

/**
 * Módulo principal de catálogos
 * Agrupa todos los catálogos del sistema para facilitar su importación
 *
 * NOTA: CategoriaNCB022 no se incluye porque ya existe como 'clasificacion_prestamo'
 * NOTA: EstadoPrestamo ya existe como entidad separada en desembolso/entities
 */
@Module({
  imports: [
    EstadoGarantiaModule,
    RecomendacionAsesorModule,
    TipoDecisionComiteModule,
    TipoPagoModule,
    EstadoPagoModule,
    SexoModule,
    EstadoSolicitudModule,
    DestinoCreditoModule,
    EstadoCuotaModule,
    TipoInteresModule,
    PeriodicidadPagoModule,
    TipoCalculoModule,
    RolModule,
  ],
  exports: [
    EstadoGarantiaModule,
    RecomendacionAsesorModule,
    TipoDecisionComiteModule,
    TipoPagoModule,
    EstadoPagoModule,
    SexoModule,
    EstadoSolicitudModule,
    DestinoCreditoModule,
    EstadoCuotaModule,
    TipoInteresModule,
    PeriodicidadPagoModule,
    TipoCalculoModule,
    RolModule,
  ],
})
export class CatalogosModule {}
