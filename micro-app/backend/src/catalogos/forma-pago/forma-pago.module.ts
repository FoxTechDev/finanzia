import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormaPagoService } from './forma-pago.service';
import { FormaPagoController } from './forma-pago.controller';
import { FormaPago } from './entities/forma-pago.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FormaPago])],
  controllers: [FormaPagoController],
  providers: [FormaPagoService],
  exports: [FormaPagoService],
})
export class FormaPagoModule {}
