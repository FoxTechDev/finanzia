import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadoPagoDto } from './create-estado-pago.dto';

export class UpdateEstadoPagoDto extends PartialType(CreateEstadoPagoDto) {}
