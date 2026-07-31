import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoAccion } from './entities/tipo-accion.entity';
import { TipoAccionService } from './tipo-accion.service';
import { TipoAccionController } from './tipo-accion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoAccion])],
  controllers: [TipoAccionController],
  providers: [TipoAccionService],
  exports: [TipoAccionService],
})
export class TipoAccionModule {}
