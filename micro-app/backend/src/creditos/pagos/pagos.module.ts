import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Pago } from './entities/pago.entity';
import { PagoDetalleCuota } from './entities/pago-detalle-cuota.entity';
import { Prestamo } from '../desembolso/entities/prestamo.entity';
import { PlanPago } from '../desembolso/entities/plan-pago.entity';

// Services
import { PagoService } from './services/pago.service';
import { PagoCalculoService } from './services/pago-calculo.service';
import { PagoConsultaService } from './services/pago-consulta.service';
import { PagoReciboService } from './services/pago-recibo.service';
import { EstadoCuentaPdfService } from './services/estado-cuenta-pdf.service';

// Controllers
import { PagoController } from './controllers/pago.controller';

// Módulos externos necesarios
import { DesembolsoModule } from '../desembolso/desembolso.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pago,
      PagoDetalleCuota,
      Prestamo,
      PlanPago,
    ]),
    DesembolsoModule, // Para usar CalculoInteresService
  ],
  controllers: [PagoController],
  providers: [
    PagoService,
    PagoCalculoService,
    PagoConsultaService,
    PagoReciboService,
    EstadoCuentaPdfService,
  ],
  exports: [
    PagoService,
    PagoCalculoService,
    PagoConsultaService,
    PagoReciboService,
    EstadoCuentaPdfService,
  ],
})
export class PagosModule {}
