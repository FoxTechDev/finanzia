import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DistritoService } from './distrito.service';
import { CreateDistritoDto } from './dto/create-distrito.dto';

@Controller('distritos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DistritoController {
  constructor(private readonly distritoService: DistritoService) {}

  @Post()
  create(@Body() createDistritoDto: CreateDistritoDto) {
    return this.distritoService.create(createDistritoDto);
  }

  @Get()
  findAll(@Query('municipioId') municipioId?: string) {
    if (municipioId) {
      return this.distritoService.findByMunicipio(+municipioId);
    }
    return this.distritoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.distritoService.findOne(id);
  }
}
