import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { SolicitudHistorial } from './entities/solicitud-historial.entity';
import { SolicitudService } from './solicitud.service';
import { SolicitudController } from './solicitud.controller';
import { TipoCreditoModule } from '../tipo-credito/tipo-credito.module';
import { EstadoSolicitudModule } from '../../catalogos/estado-solicitud/estado-solicitud.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Solicitud, SolicitudHistorial]),
    TipoCreditoModule,
    EstadoSolicitudModule,
  ],
  controllers: [SolicitudController],
  providers: [SolicitudService],
  exports: [SolicitudService],
})
export class SolicitudModule {}
