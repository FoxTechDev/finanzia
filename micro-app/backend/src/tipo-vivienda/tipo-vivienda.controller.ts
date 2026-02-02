import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TipoViviendaService } from './tipo-vivienda.service';
import { CreateTipoViviendaDto } from './dto/create-tipo-vivienda.dto';
import { UpdateTipoViviendaDto } from './dto/update-tipo-vivienda.dto';

@Controller('tipo-vivienda')
export class TipoViviendaController {
  constructor(private readonly tipoViviendaService: TipoViviendaService) {}

  @Post()
  create(@Body() createTipoViviendaDto: CreateTipoViviendaDto) {
    return this.tipoViviendaService.create(createTipoViviendaDto);
  }

  @Get()
  findAll() {
    return this.tipoViviendaService.findAll();
  }

  @Get('activos')
  findActive() {
    return this.tipoViviendaService.findActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoViviendaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoViviendaDto: UpdateTipoViviendaDto,
  ) {
    return this.tipoViviendaService.update(id, updateTipoViviendaDto);
  }

  @Patch(':id/toggle-activo')
  toggleActivo(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo') activo: boolean,
  ) {
    return this.tipoViviendaService.toggleActivo(id, activo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoViviendaService.remove(id);
  }
}
