import { PartialType } from '@nestjs/mapped-types';
import { CreateDestinoCreditoDto } from './create-destino-credito.dto';

export class UpdateDestinoCreditoDto extends PartialType(CreateDestinoCreditoDto) {}
