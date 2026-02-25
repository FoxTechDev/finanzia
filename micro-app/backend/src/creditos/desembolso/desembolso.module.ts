import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Prestamo } from './entities/prestamo.entity';
import { PlanPago } from './entities/plan-pago.entity';
import { DeduccionPrestamo } from './entities/deduccion-prestamo.entity';
import { RecargoPrestamo } from './entities/recargo-prestamo.entity';
import { TipoDeduccion } from './entities/tipo-deduccion.entity';
import { TipoRecargo } from './entities/tipo-recargo.entity';
import { ClasificacionPrestamo } from './entities/clasificacion-prestamo.entity';
import { EstadoPrestamo } from './entities/estado-prestamo.entity';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { SolicitudHistorial } from '../solicitud/entities/solicitud-historial.entity';
import { Pago } from '../pagos/entities/pago.entity';
import { PagoDetalleCuota } from '../pagos/entities/pago-detalle-cuota.entity';
import { PlanPagoHistorial } from './entities/plan-pago-historial.entity';
import { EstadoSolicitudModule } from '../../catalogos/estado-solicitud/estado-solicitud.module';

// Services
import { DesembolsoService } from './services/desembolso.service';
import { CalculoInteresService } from './services/calculo-interes.service';
import { PlanPagoService } from './services/plan-pago.service';
import { PrestamoConsultaService } from './services/prestamo-consulta.service';
import { ClasificacionPrestamoService } from './services/clasificacion-prestamo.service';
import { EstadoPrestamoService } from './services/estado-prestamo.service';
import { ReporteCarteraService } from './services/reporte-cartera.service';
import { RutaCobroService } from './services/ruta-cobro.service';
import { PlanPagoModificacionService } from './services/plan-pago-modificacion.service';

// Controllers
import { DesembolsoController } from './controllers/desembolso.controller';
import { PrestamoController } from './controllers/prestamo.controller';
import { TipoDeduccionController } from './controllers/tipo-deduccion.controller';
import { TipoRecargoController } from './controllers/tipo-recargo.controller';
import { ClasificacionPrestamoController } from './controllers/clasificacion-prestamo.controller';
import { EstadoPrestamoController } from './controllers/estado-prestamo.controller';
import { ReporteCarteraController } from './controllers/reporte-cartera.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Prestamo,
      PlanPago,
      DeduccionPrestamo,
      RecargoPrestamo,
      TipoDeduccion,
      TipoRecargo,
      ClasificacionPrestamo,
      EstadoPrestamo,
      Solicitud,
      SolicitudHistorial,
      Pago,
      PagoDetalleCuota,
      PlanPagoHistorial,
    ]),
    EstadoSolicitudModule,
  ],
  controllers: [
    DesembolsoController,
    PrestamoController,
    TipoDeduccionController,
    TipoRecargoController,
    ClasificacionPrestamoController,
    EstadoPrestamoController,
    ReporteCarteraController,
  ],
  providers: [
    DesembolsoService,
    CalculoInteresService,
    PlanPagoService,
    PrestamoConsultaService,
    ClasificacionPrestamoService,
    EstadoPrestamoService,
    ReporteCarteraService,
    RutaCobroService,
    PlanPagoModificacionService,
  ],
  exports: [
    DesembolsoService,
    CalculoInteresService,
    PlanPagoService,
    PrestamoConsultaService,
    ClasificacionPrestamoService,
    EstadoPrestamoService,
    ReporteCarteraService,
    RutaCobroService,
    PlanPagoModificacionService,
  ],
})
export class DesembolsoModule {}
