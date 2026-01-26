import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoPagoService } from './tipo-pago.service';
import { TipoPagoController } from './tipo-pago.controller';
import { TipoPago } from './entities/tipo-pago.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoPago])],
  controllers: [TipoPagoController],
  providers: [TipoPagoService],
  exports: [TipoPagoService],
})
export class TipoPagoModule {}
