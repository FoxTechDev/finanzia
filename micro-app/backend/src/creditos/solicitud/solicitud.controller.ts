import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { SolicitudService } from './solicitud.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { CambiarEstadoSolicitudDto } from './dto/cambiar-estado-solicitud.dto';
import { UpdateAnalisisAsesorDto } from './dto/update-analisis-asesor.dto';
import { TrasladarComiteDto } from '../comite/dto/trasladar-comite.dto';

@Controller('solicitudes')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @Post()
  create(@Body() createDto: CreateSolicitudDto) {
    return this.solicitudService.create(createDto);
  }

  @Get()
  findAll(
    @Query('estado') estado?: string, // Ahora recibe el código del estado como string
    @Query('personaId') personaId?: string,
    @Query('lineaCreditoId') lineaCreditoId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.solicitudService.findAll({
      estado,
      personaId: personaId ? parseInt(personaId) : undefined,
      lineaCreditoId: lineaCreditoId ? parseInt(lineaCreditoId) : undefined,
      fechaDesde,
      fechaHasta,
    });
  }

  @Get('estadisticas')
  getEstadisticas() {
    return this.solicitudService.getEstadisticas();
  }

  @Get('numero/:numero')
  findByNumero(@Param('numero') numero: string) {
    return this.solicitudService.findByNumero(numero);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findOne(id);
  }

  @Get(':id/historial')
  getHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.getHistorial(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSolicitudDto,
  ) {
    return this.solicitudService.update(id, updateDto);
  }

  @Post(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambioDto: CambiarEstadoSolicitudDto,
  ) {
    return this.solicitudService.cambiarEstado(id, cambioDto);
  }

  @Patch(':id/analisis-asesor')
  actualizarAnalisisAsesor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAnalisisAsesorDto,
  ) {
    return this.solicitudService.actualizarAnalisisAsesor(id, updateDto);
  }

  @Post(':id/trasladar-comite')
  trasladarAComite(
    @Param('id', ParseIntPipe) id: number,
    @Body() trasladarDto: TrasladarComiteDto,
  ) {
    return this.solicitudService.trasladarAComite(id, trasladarDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.remove(id);
  }
}
