import { Controller, Get, Query } from '@nestjs/common';
import { ReporteCarteraService } from '../services/reporte-cartera.service';
import {
  ReporteCarteraParamsDto,
  ReporteCarteraResponseDto,
} from '../dto/reporte-cartera.dto';

/**
 * Controlador para el reporte de Cartera de Préstamos
 * Endpoint: GET /api/reportes/cartera
 */
@Controller('reportes')
export class ReporteCarteraController {
  constructor(private readonly reporteCarteraService: ReporteCarteraService) {}

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
    const fechaCorte = new Date(params.fechaCorte);
    return this.reporteCarteraService.generarReporte(fechaCorte);
  }
}
