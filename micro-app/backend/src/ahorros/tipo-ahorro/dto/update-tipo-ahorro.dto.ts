import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoAhorroDto } from './create-tipo-ahorro.dto';

export class UpdateTipoAhorroDto extends PartialType(CreateTipoAhorroDto) {}
