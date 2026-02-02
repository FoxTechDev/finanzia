import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngresoClienteService } from './ingreso-cliente.service';
import { IngresoClienteController } from './ingreso-cliente.controller';
import { IngresoCliente } from './entities/ingreso-cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IngresoCliente])],
  controllers: [IngresoClienteController],
  providers: [IngresoClienteService],
  exports: [IngresoClienteService],
})
export class IngresoClienteModule {}
