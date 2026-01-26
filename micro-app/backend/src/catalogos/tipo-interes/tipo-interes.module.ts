import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoInteresService } from './tipo-interes.service';
import { TipoInteresController } from './tipo-interes.controller';
import { TipoInteres } from './entities/tipo-interes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoInteres])],
  controllers: [TipoInteresController],
  providers: [TipoInteresService],
  exports: [TipoInteresService],
})
export class TipoInteresModule {}
