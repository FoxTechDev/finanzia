import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { SolicitudHistorial } from './entities/solicitud-historial.entity';
import { PlanPagoSolicitud } from './entities/plan-pago-solicitud.entity';
import { RecargoSolicitud } from './entities/recargo-solicitud.entity';
import { SolicitudService } from './solicitud.service';
import { SolicitudController } from './solicitud.controller';
import { TipoCreditoModule } from '../tipo-credito/tipo-credito.module';
import { EstadoSolicitudModule } from '../../catalogos/estado-solicitud/estado-solicitud.module';
import { DesembolsoModule } from '../desembolso/desembolso.module';
import { PeriodicidadPagoModule } from '../../catalogos/periodicidad-pago/periodicidad-pago.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Solicitud,
      SolicitudHistorial,
      PlanPagoSolicitud,
      RecargoSolicitud,
    ]),
    TipoCreditoModule,
    EstadoSolicitudModule,
    DesembolsoModule, // Importar para usar CalculoInteresService y PlanPagoService
    PeriodicidadPagoModule, // Importar para obtener el código de periodicidad
  ],
  controllers: [SolicitudController],
  providers: [SolicitudService],
  exports: [SolicitudService],
})
export class SolicitudModule {}
