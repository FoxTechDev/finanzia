import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ComiteService } from './comite.service';
import { DecisionComiteDto } from './dto/decision-comite.dto';
import { TipoDecisionComite } from './entities/decision-comite.entity';

@Controller('comite')
export class ComiteController {
  constructor(private readonly comiteService: ComiteService) {}

  @Get('pendientes')
  findPendientes(
    @Query('lineaCreditoId') lineaCreditoId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('montoMinimo') montoMinimo?: string,
    @Query('montoMaximo') montoMaximo?: string,
  ) {
    return this.comiteService.findPendientes({
      lineaCreditoId: lineaCreditoId ? parseInt(lineaCreditoId) : undefined,
      fechaDesde,
      fechaHasta,
      montoMinimo: montoMinimo ? parseFloat(montoMinimo) : undefined,
      montoMaximo: montoMaximo ? parseFloat(montoMaximo) : undefined,
    });
  }

  @Get('historial')
  findHistorial(
    @Query('lineaCreditoId') lineaCreditoId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('tipoDecision') tipoDecision?: TipoDecisionComite,
  ) {
    return this.comiteService.findHistorial({
      lineaCreditoId: lineaCreditoId ? parseInt(lineaCreditoId) : undefined,
      fechaDesde,
      fechaHasta,
      tipoDecision,
    });
  }

  @Get('estadisticas')
  getEstadisticas() {
    return this.comiteService.getEstadisticasPendientes();
  }

  /**
   * Obtener información completa de solicitud para revisión del comité
   * Retorna toda la información necesaria para que el comité de crédito evalúe una solicitud:
   * datos de la solicitud, información del cliente, actividad económica, ingresos, gastos
   * y análisis financiero (capacidad de pago, ratio de endeudamiento).
   */
  @Get(':solicitudId/revision')
  findSolicitudParaComite(
    @Param('solicitudId', ParseIntPipe) solicitudId: number,
  ) {
    return this.comiteService.findSolicitudParaComite(solicitudId);
  }

  @Get(':solicitudId/decisiones')
  findDecisionesBySolicitud(
    @Param('solicitudId', ParseIntPipe) solicitudId: number,
  ) {
    return this.comiteService.findDecisionesBySolicitud(solicitudId);
  }

  @Post(':solicitudId/decision')
  registrarDecision(
    @Param('solicitudId', ParseIntPipe) solicitudId: number,
    @Body() decisionDto: DecisionComiteDto,
  ) {
    return this.comiteService.registrarDecision(solicitudId, decisionDto);
  }
}
