import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoDecisionComiteDto } from './create-tipo-decision-comite.dto';

export class UpdateTipoDecisionComiteDto extends PartialType(CreateTipoDecisionComiteDto) {}
