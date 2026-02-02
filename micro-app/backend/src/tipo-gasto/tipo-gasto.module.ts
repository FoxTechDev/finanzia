import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoGastoService } from './tipo-gasto.service';
import { TipoGastoController } from './tipo-gasto.controller';
import { TipoGasto } from './entities/tipo-gasto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoGasto])],
  controllers: [TipoGastoController],
  providers: [TipoGastoService],
  exports: [TipoGastoService],
})
export class TipoGastoModule {}
