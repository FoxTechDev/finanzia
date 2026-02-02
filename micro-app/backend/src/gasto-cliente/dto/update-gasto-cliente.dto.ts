import { PartialType } from '@nestjs/mapped-types';
import { CreateGastoClienteDto } from './create-gasto-cliente.dto';

export class UpdateGastoClienteDto extends PartialType(CreateGastoClienteDto) {}
