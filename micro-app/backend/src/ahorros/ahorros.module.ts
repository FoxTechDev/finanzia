import { Module } from '@nestjs/common';
import { LineaAhorroModule } from './linea-ahorro/linea-ahorro.module';
import { TipoAhorroModule } from './tipo-ahorro/tipo-ahorro.module';
import { CatalogosAhorroModule } from './catalogos/catalogos-ahorro.module';
import { CuentaAhorroModule } from './cuenta-ahorro/cuenta-ahorro.module';

@Module({
  imports: [
    LineaAhorroModule,
    TipoAhorroModule,
    CatalogosAhorroModule,
    CuentaAhorroModule,
  ],
  exports: [
    LineaAhorroModule,
    TipoAhorroModule,
    CatalogosAhorroModule,
    CuentaAhorroModule,
  ],
})
export class AhorrosModule {}
