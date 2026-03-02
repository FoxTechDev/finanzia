import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoCuentaAhorro } from './entities/estado-cuenta-ahorro.entity';
import { TipoCapitalizacion } from './entities/tipo-capitalizacion.entity';
import { NaturalezaMovimientoAhorro } from './entities/naturaleza-movimiento-ahorro.entity';
import { TipoTransaccionAhorro } from './entities/tipo-transaccion-ahorro.entity';
import { CatalogosAhorroService } from './services/catalogos-ahorro.service';
import { CatalogosAhorroController } from './controllers/catalogos-ahorro.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EstadoCuentaAhorro,
      TipoCapitalizacion,
      NaturalezaMovimientoAhorro,
      TipoTransaccionAhorro,
    ]),
  ],
  controllers: [CatalogosAhorroController],
  providers: [CatalogosAhorroService],
  exports: [CatalogosAhorroService],
})
export class CatalogosAhorroModule {}
