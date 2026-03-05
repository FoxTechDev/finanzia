import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentaAhorro } from './entities/cuenta-ahorro.entity';
import { TransaccionAhorro } from './entities/transaccion-ahorro.entity';
import { PlanCapitalizacion } from './entities/plan-capitalizacion.entity';
import { ProvisionAhorro } from './entities/provision-ahorro.entity';
import { BitacoraRenovacion } from './entities/bitacora-renovacion.entity';
import { BeneficiarioCuentaAhorro } from './entities/beneficiario-cuenta-ahorro.entity';
import { CuentaAhorroService } from './services/cuenta-ahorro.service';
import { CuentaAhorroConsultaService } from './services/cuenta-ahorro-consulta.service';
import { TransaccionAhorroService } from './services/transaccion-ahorro.service';
import { CapitalizacionService } from './services/capitalizacion.service';
import { ContratoDpfService } from './services/contrato-dpf.service';
import { ReporteInteresesPdfService } from './services/reporte-intereses-pdf.service';
import { ProvisionService } from './services/provision.service';
import { BeneficiarioService } from './services/beneficiario.service';
import { CuentaAhorroController } from './controllers/cuenta-ahorro.controller';
import { TransaccionAhorroController } from './controllers/transaccion-ahorro.controller';
import { BeneficiarioController } from './controllers/beneficiario.controller';
import { CatalogosAhorroModule } from '../catalogos/catalogos-ahorro.module';
import { TipoAhorroModule } from '../tipo-ahorro/tipo-ahorro.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CuentaAhorro,
      TransaccionAhorro,
      PlanCapitalizacion,
      ProvisionAhorro,
      BitacoraRenovacion,
      BeneficiarioCuentaAhorro,
    ]),
    CatalogosAhorroModule,
    TipoAhorroModule,
  ],
  controllers: [
    CuentaAhorroController,
    TransaccionAhorroController,
    BeneficiarioController,
  ],
  providers: [
    CuentaAhorroService,
    CuentaAhorroConsultaService,
    TransaccionAhorroService,
    CapitalizacionService,
    ContratoDpfService,
    ReporteInteresesPdfService,
    ProvisionService,
    BeneficiarioService,
  ],
  exports: [CuentaAhorroService, CuentaAhorroConsultaService],
})
export class CuentaAhorroModule {}
