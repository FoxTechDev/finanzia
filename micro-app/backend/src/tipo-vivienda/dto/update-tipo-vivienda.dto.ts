import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoViviendaDto } from './create-tipo-vivienda.dto';

export class UpdateTipoViviendaDto extends PartialType(CreateTipoViviendaDto) {}
