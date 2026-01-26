import { PartialType } from '@nestjs/mapped-types';
import { CreatePeriodicidadPagoDto } from './create-periodicidad-pago.dto';

export class UpdatePeriodicidadPagoDto extends PartialType(CreatePeriodicidadPagoDto) {}
