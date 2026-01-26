import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DestinoCreditoService } from './destino-credito.service';
import { DestinoCreditoController } from './destino-credito.controller';
import { DestinoCredito } from './entities/destino-credito.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DestinoCredito])],
  controllers: [DestinoCreditoController],
  providers: [DestinoCreditoService],
  exports: [DestinoCreditoService],
})
export class DestinoCreditoModule {}
