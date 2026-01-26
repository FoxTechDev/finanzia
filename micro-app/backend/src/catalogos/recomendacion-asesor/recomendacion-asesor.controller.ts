import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { RecomendacionAsesorService } from './recomendacion-asesor.service';
import { CreateRecomendacionAsesorDto } from './dto/create-recomendacion-asesor.dto';
import { UpdateRecomendacionAsesorDto } from './dto/update-recomendacion-asesor.dto';

@Controller('catalogos/recomendacion-asesor')
export class RecomendacionAsesorController {
  constructor(private readonly recomendacionAsesorService: RecomendacionAsesorService) {}

  @Post()
  create(@Body() createRecomendacionAsesorDto: CreateRecomendacionAsesorDto) {
    return this.recomendacionAsesorService.create(createRecomendacionAsesorDto);
  }

  @Get()
  findAll() {
    return this.recomendacionAsesorService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.recomendacionAsesorService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recomendacionAsesorService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.recomendacionAsesorService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecomendacionAsesorDto: UpdateRecomendacionAsesorDto,
  ) {
    return this.recomendacionAsesorService.update(id, updateRecomendacionAsesorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recomendacionAsesorService.remove(id);
  }
}
