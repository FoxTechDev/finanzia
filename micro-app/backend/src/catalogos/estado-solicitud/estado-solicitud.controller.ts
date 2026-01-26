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
import { EstadoSolicitudService } from './estado-solicitud.service';
import { CreateEstadoSolicitudDto } from './dto/create-estado-solicitud.dto';
import { UpdateEstadoSolicitudDto } from './dto/update-estado-solicitud.dto';

@Controller('catalogos/estado-solicitud')
export class EstadoSolicitudController {
  constructor(private readonly estadoSolicitudService: EstadoSolicitudService) {}

  @Post()
  create(@Body() createEstadoSolicitudDto: CreateEstadoSolicitudDto) {
    return this.estadoSolicitudService.create(createEstadoSolicitudDto);
  }

  @Get()
  findAll() {
    return this.estadoSolicitudService.findAll();
  }

  @Get('activos')
  findActivos() {
    return this.estadoSolicitudService.findActivos();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estadoSolicitudService.findOne(id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.estadoSolicitudService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoSolicitudDto: UpdateEstadoSolicitudDto,
  ) {
    return this.estadoSolicitudService.update(id, updateEstadoSolicitudDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.estadoSolicitudService.remove(id);
  }
}
