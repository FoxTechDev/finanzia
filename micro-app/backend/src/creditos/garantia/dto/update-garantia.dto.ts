import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateGarantiaDto } from './create-garantia.dto';

export class UpdateGarantiaDto extends PartialType(
  OmitType(CreateGarantiaDto, ['solicitudId'] as const),
) {}
