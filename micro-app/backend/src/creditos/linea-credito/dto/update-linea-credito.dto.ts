import { PartialType } from '@nestjs/mapped-types';
import { CreateLineaCreditoDto } from './create-linea-credito.dto';

export class UpdateLineaCreditoDto extends PartialType(CreateLineaCreditoDto) {}
