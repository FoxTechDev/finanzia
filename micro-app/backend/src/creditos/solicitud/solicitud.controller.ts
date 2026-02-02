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
import { CalcularPlanPagoDto } from './dto/calcular-plan-pago.dto';
import { GuardarPlanPagoDto } from './dto/guardar-plan-pago.dto';

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

  /**
   * Calcula y previsualiza el plan de pago SIN guardar en base de datos
   * Útil para que el usuario simule diferentes escenarios antes de guardar
   */
  @Post('calcular-plan')
  calcularPlanPago(@Body() calcularDto: CalcularPlanPagoDto) {
    return this.solicitudService.calcularPlanPago(calcularDto);
  }

  /**
   * Calcula Y GUARDA el plan de pago en la base de datos
   * Se debe usar cuando la solicitud es aprobada
   */
  @Post(':id/guardar-plan-pago')
  guardarPlanPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() guardarDto: GuardarPlanPagoDto,
  ) {
    return this.solicitudService.guardarPlanPago(id, guardarDto);
  }

  /**
   * Obtiene el plan de pago guardado de una solicitud
   * Retorna el plan completo con recargos y totales
   */
  @Get(':id/plan-pago')
  obtenerPlanPagoGuardado(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.obtenerPlanPagoGuardado(id);
  }

  @Get('numero/:numero')
  findByNumero(@Param('numero') numero: string) {
    return this.solicitudService.findByNumero(numero);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findOne(id);
  }

  /**
   * Obtener solicitud con plan de pago calculado
   * Retorna toda la información de la solicitud incluyendo: datos básicos, cliente,
   * tipo de crédito, periodicidad de pago y el plan de pago calculado dinámicamente.
   * Útil para la vista de consulta de solicitud.
   */
  @Get(':id/detalle')
  findOneConPlanPago(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findOneConPlanPago(id);
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
