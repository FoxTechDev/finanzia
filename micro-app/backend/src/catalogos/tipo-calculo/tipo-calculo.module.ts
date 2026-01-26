import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoCalculoService } from './tipo-calculo.service';
import { TipoCalculoController } from './tipo-calculo.controller';
import { TipoCalculo } from './entities/tipo-calculo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoCalculo])],
  controllers: [TipoCalculoController],
  providers: [TipoCalculoService],
  exports: [TipoCalculoService],
})
export class TipoCalculoModule {}
