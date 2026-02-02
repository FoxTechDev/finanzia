import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GastoClienteService } from './gasto-cliente.service';
import { GastoClienteController } from './gasto-cliente.controller';
import { GastoCliente } from './entities/gasto-cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GastoCliente])],
  controllers: [GastoClienteController],
  providers: [GastoClienteService],
  exports: [GastoClienteService],
})
export class GastoClienteModule {}
