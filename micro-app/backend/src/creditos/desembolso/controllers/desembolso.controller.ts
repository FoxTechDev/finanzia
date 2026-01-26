import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { DesembolsoService, PreviewResponse } from '../services/desembolso.service';
import { PreviewDesembolsoDto } from '../dto/preview-desembolso.dto';
import { CrearDesembolsoDto } from '../dto/crear-desembolso.dto';
import { Prestamo, EstadoPrestamo } from '../entities/prestamo.entity';
import { PlanPago } from '../entities/plan-pago.entity';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';

@Controller('desembolso')
export class DesembolsoController {
  constructor(private readonly desembolsoService: DesembolsoService) {}

  /**
   * GET /api/desembolso/pendientes
   * Lista solicitudes autorizadas pendientes de desembolso
   */
  @Get('pendientes')
  async getPendientes(): Promise<Solicitud[]> {
    return this.desembolsoService.getPendientes();
  }

  /**
   * POST /api/desembolso/preview
   * Genera un preview del desembolso sin guardar
   */
  @Post('preview')
  async preview(@Body() dto: PreviewDesembolsoDto): Promise<PreviewResponse> {
    return this.desembolsoService.preview(dto);
  }

  /**
   * POST /api/desembolso
   * Confirma y crea el desembolso
   */
  @Post()
  async crear(@Body() dto: CrearDesembolsoDto): Promise<Prestamo> {
    return this.desembolsoService.crear(dto);
  }

  /**
   * GET /api/desembolso/:id
   * Obtiene el detalle de un préstamo
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Prestamo> {
    return this.desembolsoService.findOne(id);
  }

  /**
   * GET /api/desembolso/:id/plan-pago
   * Obtiene el plan de pago de un préstamo
   */
  @Get(':id/plan-pago')
  async getPlanPago(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlanPago[]> {
    return this.desembolsoService.getPlanPago(id);
  }

  /**
   * GET /api/desembolso
   * Lista todos los préstamos
   */
  @Get()
  async findAll(
    @Query('estado') estado?: EstadoPrestamo,
  ): Promise<Prestamo[]> {
    return this.desembolsoService.findAll(estado);
  }
}
