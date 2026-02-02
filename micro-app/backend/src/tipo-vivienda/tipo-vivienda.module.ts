import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoViviendaService } from './tipo-vivienda.service';
import { TipoViviendaController } from './tipo-vivienda.controller';
import { TipoVivienda } from './entities/tipo-vivienda.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoVivienda])],
  controllers: [TipoViviendaController],
  providers: [TipoViviendaService],
  exports: [TipoViviendaService],
})
export class TipoViviendaModule {}
