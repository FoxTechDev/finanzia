import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GarantiaService } from './garantia.service';
import { GarantiaController } from './garantia.controller';
import { CatalogoGarantiaService } from './services/catalogo-garantia.service';
import { CatalogoGarantiaController } from './controllers/catalogo-garantia.controller';
import { Garantia } from './entities/garantia.entity';
import { GarantiaHipotecaria } from './entities/garantia-hipotecaria.entity';
import { GarantiaPrendaria } from './entities/garantia-prendaria.entity';
import { GarantiaFiador } from './entities/garantia-fiador.entity';
import { GarantiaDocumentaria } from './entities/garantia-documentaria.entity';
import { TipoGarantiaCatalogo } from './entities/tipo-garantia-catalogo.entity';
import { TipoInmueble } from './entities/tipo-inmueble.entity';
import { TipoDocumentoGarantia } from './entities/tipo-documento-garantia.entity';
import { Solicitud } from '../solicitud/entities/solicitud.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Garantia,
      GarantiaHipotecaria,
      GarantiaPrendaria,
      GarantiaFiador,
      GarantiaDocumentaria,
      TipoGarantiaCatalogo,
      TipoInmueble,
      TipoDocumentoGarantia,
      Solicitud,
    ]),
  ],
  controllers: [GarantiaController, CatalogoGarantiaController],
  providers: [GarantiaService, CatalogoGarantiaService],
  exports: [GarantiaService, CatalogoGarantiaService],
})
export class GarantiaModule {}
