import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoCuotaService } from './estado-cuota.service';
import { EstadoCuotaController } from './estado-cuota.controller';
import { EstadoCuota } from './entities/estado-cuota.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoCuota])],
  controllers: [EstadoCuotaController],
  providers: [EstadoCuotaService],
  exports: [EstadoCuotaService],
})
export class EstadoCuotaModule {}
