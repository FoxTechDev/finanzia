import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SexoService } from './sexo.service';
import { SexoController } from './sexo.controller';
import { Sexo } from './entities/sexo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sexo])],
  controllers: [SexoController],
  providers: [SexoService],
  exports: [SexoService],
})
export class SexoModule {}
