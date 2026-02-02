import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoIngresoService } from './tipo-ingreso.service';
import { TipoIngresoController } from './tipo-ingreso.controller';
import { TipoIngreso } from './entities/tipo-ingreso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoIngreso])],
  controllers: [TipoIngresoController],
  providers: [TipoIngresoService],
  exports: [TipoIngresoService],
})
export class TipoIngresoModule {}
