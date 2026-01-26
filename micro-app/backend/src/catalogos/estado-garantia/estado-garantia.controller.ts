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
import { EstadoGarantiaService } from './estado-garantia.service';
import { CreateEstadoGarantiaDto } from './dto/create-estado-garantia.dto';
import { UpdateEstadoGarantiaDto } from './dto/update-estado-garantia.dto';

@Controller('catalogos/estado-garantia')
export class EstadoGarantiaController {
  constructor(private readonly estadoGarantiaService: EstadoGarantiaService) {}

  @Post()
  create(@Body() createEstadoGarantiaDto: CreateEstadoGarantiaDto) {
    return this.estadoGarantiaService.create(createEstadoGarantiaDto);
  }

  @Get()
  findAll() {
    return this.estadoGarantiaService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.estadoGarantiaService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estadoGarantiaService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.estadoGarantiaService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoGarantiaDto: UpdateEstadoGarantiaDto,
  ) {
    return this.estadoGarantiaService.update(id, updateEstadoGarantiaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.estadoGarantiaService.remove(id);
  }
}
