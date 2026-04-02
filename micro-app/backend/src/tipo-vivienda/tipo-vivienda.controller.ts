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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TipoViviendaService } from './tipo-vivienda.service';
import { CreateTipoViviendaDto } from './dto/create-tipo-vivienda.dto';
import { UpdateTipoViviendaDto } from './dto/update-tipo-vivienda.dto';

@Controller('tipo-vivienda')
@UseGuards(JwtAuthGuard, RolesGuard)
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
