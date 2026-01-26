import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoGarantiaService } from './estado-garantia.service';
import { EstadoGarantiaController } from './estado-garantia.controller';
import { EstadoGarantia } from './entities/estado-garantia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoGarantia])],
  controllers: [EstadoGarantiaController],
  providers: [EstadoGarantiaService],
  exports: [EstadoGarantiaService],
})
export class EstadoGarantiaModule {}
