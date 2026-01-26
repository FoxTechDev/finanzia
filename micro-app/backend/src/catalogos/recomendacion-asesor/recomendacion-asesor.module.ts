import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecomendacionAsesorService } from './recomendacion-asesor.service';
import { RecomendacionAsesorController } from './recomendacion-asesor.controller';
import { RecomendacionAsesor } from './entities/recomendacion-asesor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecomendacionAsesor])],
  controllers: [RecomendacionAsesorController],
  providers: [RecomendacionAsesorService],
  exports: [RecomendacionAsesorService],
})
export class RecomendacionAsesorModule {}
