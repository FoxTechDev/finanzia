import { IsNumber, IsOptional, IsString, IsPositive, Min } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { CreateIngresoClienteDto } from './create-ingreso-cliente.dto';

/**
 * DTO para crear un ingreso cuando está anidado dentro de CreatePersonaDto.
 * Omite el campo personaId ya que se asignará automáticamente.
 */
export class CreateIngresoNestedDto extends OmitType(CreateIngresoClienteDto, ['personaId'] as const) {}
