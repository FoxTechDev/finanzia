import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoCredito } from './entities/tipo-credito.entity';
import { LineaCredito } from '../linea-credito/entities/linea-credito.entity';
import { TipoCreditoService } from './tipo-credito.service';
import { TipoCreditoController } from './tipo-credito.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoCredito, LineaCredito])],
  controllers: [TipoCreditoController],
  providers: [TipoCreditoService],
  exports: [TipoCreditoService],
})
export class TipoCreditoModule {}
