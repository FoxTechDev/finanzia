import { PartialType } from '@nestjs/mapped-types';
import { CreateRecomendacionAsesorDto } from './create-recomendacion-asesor.dto';

export class UpdateRecomendacionAsesorDto extends PartialType(CreateRecomendacionAsesorDto) {}
