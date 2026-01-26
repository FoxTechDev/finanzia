import { Module } from '@nestjs/common';
import { LineaCreditoModule } from './linea-credito/linea-credito.module';
import { TipoCreditoModule } from './tipo-credito/tipo-credito.module';
import { SolicitudModule } from './solicitud/solicitud.module';
import { GarantiaModule } from './garantia/garantia.module';
import { ComiteModule } from './comite/comite.module';
import { DesembolsoModule } from './desembolso/desembolso.module';
import { PagosModule } from './pagos/pagos.module';

@Module({
  imports: [
    LineaCreditoModule,
    TipoCreditoModule,
    SolicitudModule,
    GarantiaModule,
    ComiteModule,
    DesembolsoModule,
    PagosModule,
  ],
  exports: [
    LineaCreditoModule,
    TipoCreditoModule,
    SolicitudModule,
    GarantiaModule,
    ComiteModule,
    DesembolsoModule,
    PagosModule,
  ],
})
export class CreditosModule {}
