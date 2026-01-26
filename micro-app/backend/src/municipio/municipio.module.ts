import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MunicipioService } from './municipio.service';
import { MunicipioController } from './municipio.controller';
import { Municipio } from './entities/municipio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Municipio])],
  controllers: [MunicipioController],
  providers: [MunicipioService],
  exports: [MunicipioService],
})
export class MunicipioModule {}
