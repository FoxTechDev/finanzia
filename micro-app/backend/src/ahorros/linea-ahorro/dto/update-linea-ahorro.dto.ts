import { PartialType } from '@nestjs/mapped-types';
import { CreateLineaAhorroDto } from './create-linea-ahorro.dto';

export class UpdateLineaAhorroDto extends PartialType(CreateLineaAhorroDto) {}
