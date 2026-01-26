import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadoCuotaDto } from './create-estado-cuota.dto';

export class UpdateEstadoCuotaDto extends PartialType(CreateEstadoCuotaDto) {}
