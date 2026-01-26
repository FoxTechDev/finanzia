import { Controller, Get, Post, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MunicipioService } from './municipio.service';
import { CreateMunicipioDto } from './dto/create-municipio.dto';

@Controller('municipios')
export class MunicipioController {
  constructor(private readonly municipioService: MunicipioService) {}

  @Post()
  create(@Body() createMunicipioDto: CreateMunicipioDto) {
    return this.municipioService.create(createMunicipioDto);
  }

  @Get()
  findAll(@Query('departamentoId') departamentoId?: string) {
    if (departamentoId) {
      return this.municipioService.findByDepartamento(+departamentoId);
    }
    return this.municipioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.municipioService.findOne(id);
  }
}
