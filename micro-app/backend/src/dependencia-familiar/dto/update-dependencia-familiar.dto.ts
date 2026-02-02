import { PartialType } from '@nestjs/mapped-types';
import { CreateDependenciaFamiliarDto } from './create-dependencia-familiar.dto';

export class UpdateDependenciaFamiliarDto extends PartialType(CreateDependenciaFamiliarDto) {}
