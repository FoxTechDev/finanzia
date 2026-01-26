import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistritoService } from './distrito.service';
import { DistritoController } from './distrito.controller';
import { Distrito } from './entities/distrito.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Distrito])],
  controllers: [DistritoController],
  providers: [DistritoService],
  exports: [DistritoService],
})
export class DistritoModule {}
