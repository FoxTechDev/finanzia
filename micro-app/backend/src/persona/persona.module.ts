import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonaService } from './persona.service';
import { PersonaController } from './persona.controller';
import { Persona } from './entities/persona.entity';
import { Direccion } from '../direccion/entities/direccion.entity';
import { ActividadEconomica } from '../actividad-economica/entities/actividad-economica.entity';
import { ReferenciaPersonal } from '../referencia-personal/entities/referencia-personal.entity';
import { ReferenciaFamiliar } from '../referencia-familiar/entities/referencia-familiar.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Persona,
      Direccion,
      ActividadEconomica,
      ReferenciaPersonal,
      ReferenciaFamiliar,
    ]),
  ],
  controllers: [PersonaController],
  providers: [PersonaService],
  exports: [PersonaService],
})
export class PersonaModule {}
