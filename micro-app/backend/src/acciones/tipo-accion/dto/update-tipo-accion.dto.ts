import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoAccionDto } from './create-tipo-accion.dto';

export class UpdateTipoAccionDto extends PartialType(CreateTipoAccionDto) {}
