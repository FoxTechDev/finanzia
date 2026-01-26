import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoPagoService } from './estado-pago.service';
import { EstadoPagoController } from './estado-pago.controller';
import { EstadoPago } from './entities/estado-pago.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoPago])],
  controllers: [EstadoPagoController],
  providers: [EstadoPagoService],
  exports: [EstadoPagoService],
})
export class EstadoPagoModule {}
