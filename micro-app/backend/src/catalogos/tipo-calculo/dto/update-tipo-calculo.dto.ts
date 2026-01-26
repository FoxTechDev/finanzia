import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoCalculoDto } from './create-tipo-calculo.dto';

export class UpdateTipoCalculoDto extends PartialType(CreateTipoCalculoDto) {}
