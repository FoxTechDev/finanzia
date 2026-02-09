import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PersonaService } from './persona.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Controller('personas')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post()
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personaService.create(createPersonaDto);
  }

  @Get()
  findAll(
    @Query('nombre') nombre?: string,
    @Query('dui') dui?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Si no hay filtros, retornar lista vacía (no cargar todos automáticamente)
    if (!nombre && !dui) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }
    return this.personaService.findAllPaginated({
      nombre,
      dui,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('buscar')
  findByDui(@Query('dui') dui: string) {
    return this.personaService.findByDui(dui);
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    return this.personaService.search(query, limit ? parseInt(limit) : 10);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonaDto: UpdatePersonaDto,
  ) {
    return this.personaService.update(id, updatePersonaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personaService.remove(id);
  }
}
