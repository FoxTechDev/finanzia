import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodicidadPagoService } from './periodicidad-pago.service';
import { PeriodicidadPagoController } from './periodicidad-pago.controller';
import { PeriodicidadPago } from './entities/periodicidad-pago.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PeriodicidadPago])],
  controllers: [PeriodicidadPagoController],
  providers: [PeriodicidadPagoService],
  exports: [PeriodicidadPagoService],
})
export class PeriodicidadPagoModule {}
