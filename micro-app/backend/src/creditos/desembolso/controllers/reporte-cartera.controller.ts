import { Controller, Get, Query } from '@nestjs/common';
import { ReporteCarteraService } from '../services/reporte-cartera.service';
import { RutaCobroService } from '../services/ruta-cobro.service';
import {
  ReporteCarteraParamsDto,
  ReporteCarteraResponseDto,
} from '../dto/reporte-cartera.dto';
import {
  RutaCobroParamsDto,
  RutaCobroResponseDto,
} from '../dto/ruta-cobro.dto';
import { parseLocalDate } from '../../../common/utils/date.utils';

/**
 * Controlador para reportes de Cartera y Ruta de Cobro
 * Endpoints:
 *   GET /api/reportes/cartera
 *   GET /api/reportes/ruta-cobro
 */
@Controller('reportes')
export class ReporteCarteraController {
  constructor(
    private readonly reporteCarteraService: ReporteCarteraService,
    private readonly rutaCobroService: RutaCobroService,
  ) {}

  /**
   * GET /api/reportes/cartera
   * Genera el reporte de cartera a una fecha de corte específica
   *
   * @param params - Parámetros del reporte (fechaCorte)
   * @returns Reporte completo con todos los préstamos vigentes/mora y sus saldos
   *
   * @example
   * GET /api/reportes/cartera?fechaCorte=2026-02-08
   *
   * Respuesta:
   * {
   *   "fechaCorte": "2026-02-08T00:00:00.000Z",
   *   "totalPrestamos": 150,
   *   "totalMonto": 500000.00,
   *   "totalSaldoCapital": 350000.00,
   *   "totalSaldoInteres": 45000.00,
   *   "totalCapitalMora": 12000.00,
   *   "totalInteresMora": 1500.00,
   *   "prestamos": [
   *     {
   *       "numeroCredito": "CRE2026000001",
   *       "nombreCliente": "Juan Pérez",
   *       "lineaCredito": "Microcrédito",
   *       "tipoCredito": "Crédito Personal",
   *       "fechaOtorgamiento": "2025-12-01",
   *       "fechaVencimiento": "2026-12-01",
   *       "monto": 5000.00,
   *       "plazo": 12,
   *       "tasaInteres": 18.50,
   *       "cuotaTotal": 465.25,
   *       "numeroCuotas": 12,
   *       "saldoCapital": 4200.00,
   *       "saldoInteres": 380.00,
   *       "cuotasAtrasadas": 2,
   *       "capitalMora": 800.00,
   *       "interesMora": 65.00
   *     }
   *   ]
   * }
   */
  @Get('cartera')
  async obtenerReporteCartera(
    @Query() params: ReporteCarteraParamsDto,
  ): Promise<ReporteCarteraResponseDto> {
    const fechaCorte = parseLocalDate(params.fechaCorte);
    return this.reporteCarteraService.generarReporte(fechaCorte);
  }

  /**
   * GET /api/reportes/ruta-cobro
   * Lista las cuotas pendientes de pago en un rango de fechas de vencimiento
   *
   * @param params - Parámetros del reporte (fechaDesde, fechaHasta)
   * @returns Listado de cuotas con estado PENDIENTE, PARCIAL o MORA
   *
   * @example
   * GET /api/reportes/ruta-cobro?fechaDesde=2026-02-01&fechaHasta=2026-02-28
   *
   * Respuesta:
   * {
   *   "fechaDesde": "2026-02-01",
   *   "fechaHasta": "2026-02-28",
   *   "totalCuotas": 35,
   *   "totalMonto": 17500.00,
   *   "cuotas": [
   *     {
   *       "fechaVencimiento": "2026-02-05",
   *       "nombreCliente": "García López, Ana",
   *       "numeroCredito": "CRE2025000012",
   *       "numeroCuota": 3,
   *       "cuotaTotal": 500.00,
   *       "estado": "PENDIENTE"
   *     }
   *   ]
   * }
   */
  @Get('ruta-cobro')
  async obtenerRutaCobro(
    @Query() params: RutaCobroParamsDto,
  ): Promise<RutaCobroResponseDto> {
    return this.rutaCobroService.generarReporte(params);
  }
}
