import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MunicipioService } from './municipio.service';
import { CreateMunicipioDto } from './dto/create-municipio.dto';

@Controller('municipios')
@UseGuards(JwtAuthGuard, RolesGuard)
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
