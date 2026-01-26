import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadoGarantiaDto } from './create-estado-garantia.dto';

export class UpdateEstadoGarantiaDto extends PartialType(CreateEstadoGarantiaDto) {}
