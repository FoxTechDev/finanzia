import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoCreditoDto } from './create-tipo-credito.dto';

export class UpdateTipoCreditoDto extends PartialType(CreateTipoCreditoDto) {}
