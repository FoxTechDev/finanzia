import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accion } from './entities/accion.entity';
import { AccionDividendo } from './entities/accion-dividendo.entity';
import { TipoAccion } from '../tipo-accion/entities/tipo-accion.entity';
import { CuentaAhorro } from '../../ahorros/cuenta-ahorro/entities/cuenta-ahorro.entity';
import { TransaccionAhorro } from '../../ahorros/cuenta-ahorro/entities/transaccion-ahorro.entity';
import { AccionService } from './services/accion.service';
import { AccionDividendoService } from './services/accion-dividendo.service';
import { AccionController } from './controllers/accion.controller';
import { CatalogosAhorroModule } from '../../ahorros/catalogos/catalogos-ahorro.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Accion,
      AccionDividendo,
      TipoAccion,
      CuentaAhorro,
      TransaccionAhorro,
    ]),
    CatalogosAhorroModule,
  ],
  controllers: [AccionController],
  providers: [AccionService, AccionDividendoService],
  exports: [AccionService, AccionDividendoService],
})
export class AccionModule {}
