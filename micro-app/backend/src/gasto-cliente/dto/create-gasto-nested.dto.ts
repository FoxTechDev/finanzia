import { IsNumber, IsOptional, IsString, IsPositive, Min } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { CreateGastoClienteDto } from './create-gasto-cliente.dto';

/**
 * DTO para crear un gasto cuando está anidado dentro de CreatePersonaDto.
 * Omite el campo personaId ya que se asignará automáticamente.
 */
export class CreateGastoNestedDto extends OmitType(CreateGastoClienteDto, ['personaId'] as const) {}
