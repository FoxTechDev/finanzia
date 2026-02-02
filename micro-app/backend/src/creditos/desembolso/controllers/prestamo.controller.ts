import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PrestamoConsultaService } from '../services/prestamo-consulta.service';
import { FiltrosPrestamoDto } from '../dto/filtros-prestamo.dto';
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
  constructor(private readonly prestamoConsultaService: PrestamoConsultaService) {}

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
