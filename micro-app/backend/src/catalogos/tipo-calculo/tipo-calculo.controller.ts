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
import { TipoCalculoService } from './tipo-calculo.service';
import { CreateTipoCalculoDto } from './dto/create-tipo-calculo.dto';
import { UpdateTipoCalculoDto } from './dto/update-tipo-calculo.dto';

@Controller('catalogos/tipo-calculo')
export class TipoCalculoController {
  constructor(private readonly tipoCalculoService: TipoCalculoService) {}

  @Post()
  create(@Body() createTipoCalculoDto: CreateTipoCalculoDto) {
    return this.tipoCalculoService.create(createTipoCalculoDto);
  }

  @Get()
  findAll() {
    return this.tipoCalculoService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.tipoCalculoService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoCalculoService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.tipoCalculoService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoCalculoDto: UpdateTipoCalculoDto,
  ) {
    return this.tipoCalculoService.update(id, updateTipoCalculoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tipoCalculoService.remove(id);
  }
}
