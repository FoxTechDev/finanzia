import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoIngresoDto } from './create-tipo-ingreso.dto';

export class UpdateTipoIngresoDto extends PartialType(CreateTipoIngresoDto) {}
