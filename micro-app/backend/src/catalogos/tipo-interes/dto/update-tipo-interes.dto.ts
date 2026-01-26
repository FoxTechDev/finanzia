import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoInteresDto } from './create-tipo-interes.dto';

export class UpdateTipoInteresDto extends PartialType(CreateTipoInteresDto) {}
