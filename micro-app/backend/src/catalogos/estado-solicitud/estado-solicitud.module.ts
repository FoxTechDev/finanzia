import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoSolicitudService } from './estado-solicitud.service';
import { EstadoSolicitudController } from './estado-solicitud.controller';
import { EstadoSolicitud } from './entities/estado-solicitud.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoSolicitud])],
  controllers: [EstadoSolicitudController],
  providers: [EstadoSolicitudService],
  exports: [EstadoSolicitudService],
})
export class EstadoSolicitudModule {}
