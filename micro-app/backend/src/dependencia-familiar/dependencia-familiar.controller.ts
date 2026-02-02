import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DependenciaFamiliarService } from './dependencia-familiar.service';
import { CreateDependenciaFamiliarDto } from './dto/create-dependencia-familiar.dto';
import { UpdateDependenciaFamiliarDto } from './dto/update-dependencia-familiar.dto';

@Controller('personas/:personaId/dependencias')
export class DependenciaFamiliarController {
  constructor(
    private readonly dependenciaFamiliarService: DependenciaFamiliarService,
  ) {}

  @Post()
  create(
    @Param('personaId', ParseIntPipe) personaId: number,
    @Body() createDto: CreateDependenciaFamiliarDto,
  ) {
    return this.dependenciaFamiliarService.create(personaId, createDto);
  }

  @Get()
  findAll(@Param('personaId', ParseIntPipe) personaId: number) {
    return this.dependenciaFamiliarService.findByPersona(personaId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dependenciaFamiliarService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDependenciaFamiliarDto,
  ) {
    return this.dependenciaFamiliarService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dependenciaFamiliarService.remove(id);
  }
}
