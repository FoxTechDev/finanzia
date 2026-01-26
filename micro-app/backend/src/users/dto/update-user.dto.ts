import { IsEmail, IsOptional, IsString, MinLength, IsNumber, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsNumber()
  @IsOptional()
  rolId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
