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
import { TipoIngresoService } from './tipo-ingreso.service';
import { CreateTipoIngresoDto } from './dto/create-tipo-ingreso.dto';
import { UpdateTipoIngresoDto } from './dto/update-tipo-ingreso.dto';

@Controller('tipo-ingreso')
export class TipoIngresoController {
  constructor(private readonly tipoIngresoService: TipoIngresoService) {}

  @Post()
  create(@Body() createTipoIngresoDto: CreateTipoIngresoDto) {
    return this.tipoIngresoService.create(createTipoIngresoDto);
  }

  @Get()
  findAll() {
    return this.tipoIngresoService.findAll();
  }

  @Get('activos')
  findActive() {
    return this.tipoIngresoService.findActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoIngresoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoIngresoDto: UpdateTipoIngresoDto,
  ) {
    return this.tipoIngresoService.update(id, updateTipoIngresoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoIngresoService.remove(id);
  }
}
