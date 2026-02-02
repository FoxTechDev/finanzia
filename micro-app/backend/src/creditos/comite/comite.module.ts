import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComiteController } from './comite.controller';
import { ComiteService } from './comite.service';
import { DecisionComite } from './entities/decision-comite.entity';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { SolicitudHistorial } from '../solicitud/entities/solicitud-historial.entity';
import { EstadoSolicitudModule } from '../../catalogos/estado-solicitud/estado-solicitud.module';
import { IngresoClienteModule } from '../../ingreso-cliente/ingreso-cliente.module';
import { GastoClienteModule } from '../../gasto-cliente/gasto-cliente.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DecisionComite, Solicitud, SolicitudHistorial]),
    EstadoSolicitudModule,
    IngresoClienteModule,
    GastoClienteModule,
  ],
  controllers: [ComiteController],
  providers: [ComiteService],
  exports: [ComiteService],
})
export class ComiteModule {}
