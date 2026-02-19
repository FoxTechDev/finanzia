import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { RoleCodes } from '../../../auth/enums/roles.enum';
import { PrestamoConsultaService } from '../services/prestamo-consulta.service';
import { PlanPagoModificacionService } from '../services/plan-pago-modificacion.service';
import { FiltrosPrestamoDto } from '../dto/filtros-prestamo.dto';
import { ModificarPlanPagoDto, PreviewPlanPagoDto } from '../dto/modificar-plan-pago.dto';
import {
  PrestamoDetalleDto,
  PlanPagoDetalleDto,
  PrestamoResumenDto,
  PrestamoPaginadoDto,
} from '../dto/prestamo-detalle.dto';

/**
 * Controlador para consultas de préstamos
 * Endpoints para listar, filtrar y obtener información detallada de préstamos
 */
@Controller('prestamos')
export class PrestamoController {
  constructor(
    private readonly prestamoConsultaService: PrestamoConsultaService,
    private readonly planPagoModificacionService: PlanPagoModificacionService,
  ) {}

  /**
   * GET /api/prestamos
   * Lista todos los préstamos con filtros y paginación
   */
  @Get()
  async listarPrestamos(@Query() filtros: FiltrosPrestamoDto): Promise<PrestamoPaginadoDto> {
    return this.prestamoConsultaService.listarPrestamos(filtros);
  }

  /**
   * GET /api/prestamos/:id
   * Obtiene un préstamo con toda su información detallada
   */
  @Get(':id')
  async obtenerPrestamo(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PrestamoDetalleDto> {
    return this.prestamoConsultaService.obtenerPrestamoDetallado(id);
  }

  /**
   * GET /api/prestamos/:id/plan-pago/historial
   * Obtiene el historial de modificaciones del plan de pagos
   */
  @Get(':id/plan-pago/historial')
  async obtenerHistorialPlanPago(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.planPagoModificacionService.obtenerHistorial(id);
  }

  /**
   * GET /api/prestamos/:id/plan-pago
   * Obtiene el plan de pagos detallado de un préstamo
   */
  @Get(':id/plan-pago')
  async obtenerPlanPago(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlanPagoDetalleDto[]> {
    return this.prestamoConsultaService.obtenerPlanPago(id);
  }

  /**
   * POST /api/prestamos/:id/plan-pago/preview
   * Genera un preview del nuevo plan de pagos sin guardar
   * Solo ADMIN y COMITE
   */
  @Post(':id/plan-pago/preview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCodes.ADMIN, RoleCodes.COMITE)
  async previewPlanPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PreviewPlanPagoDto,
  ) {
    return this.planPagoModificacionService.previewPlanPago(id, dto);
  }

  /**
   * PUT /api/prestamos/:id/plan-pago
   * Modifica el plan de pagos de un préstamo
   * Solo ADMIN y COMITE
   */
  @Put(':id/plan-pago')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCodes.ADMIN, RoleCodes.COMITE)
  async modificarPlanPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModificarPlanPagoDto,
  ) {
    dto.prestamoId = id;
    return this.planPagoModificacionService.modificarPlanPago(dto);
  }

  /**
   * GET /api/prestamos/cliente/:personaId
   * Obtiene todos los préstamos de un cliente específico
   */
  @Get('cliente/:personaId')
  async obtenerPrestamosPorCliente(
    @Param('personaId', ParseIntPipe) personaId: number,
  ): Promise<PrestamoResumenDto[]> {
    return this.prestamoConsultaService.obtenerPrestamosPorCliente(personaId);
  }

  /**
   * GET /api/prestamos/cliente/:personaId/activos
   * Obtiene los préstamos activos (VIGENTE o MORA) de un cliente
   * Usado para la funcionalidad de refinanciamiento
   */
  @Get('cliente/:personaId/activos')
  async obtenerPrestamosActivosPorCliente(
    @Param('personaId', ParseIntPipe) personaId: number,
  ): Promise<PrestamoResumenDto[]> {
    return this.prestamoConsultaService.obtenerPrestamosActivosPorCliente(personaId);
  }
}
