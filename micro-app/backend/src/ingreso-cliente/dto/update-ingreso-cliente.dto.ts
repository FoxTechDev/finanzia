import { PartialType } from '@nestjs/mapped-types';
import { CreateIngresoClienteDto } from './create-ingreso-cliente.dto';

export class UpdateIngresoClienteDto extends PartialType(CreateIngresoClienteDto) {}
