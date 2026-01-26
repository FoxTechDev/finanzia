import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineaCredito } from './entities/linea-credito.entity';
import { LineaCreditoService } from './linea-credito.service';
import { LineaCreditoController } from './linea-credito.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LineaCredito])],
  controllers: [LineaCreditoController],
  providers: [LineaCreditoService],
  exports: [LineaCreditoService],
})
export class LineaCreditoModule {}
