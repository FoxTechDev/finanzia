import { Module } from '@nestjs/common';
import { TipoAccionModule } from './tipo-accion/tipo-accion.module';
import { AccionModule } from './accion/accion.module';

@Module({
  imports: [TipoAccionModule, AccionModule],
  exports: [TipoAccionModule, AccionModule],
})
export class AccionesModule {}
