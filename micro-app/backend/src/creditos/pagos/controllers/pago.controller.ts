import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { PagoService, PreviewPagoResponse } from '../services/pago.service';
import { PagoConsultaService, EstadoCuenta, PaginatedPagos } from '../services/pago-consulta.service';
import { PagoCalculoService, ResumenAdeudo } from '../services/pago-calculo.service';
import { PagoReciboService } from '../services/pago-recibo.service';
import { EstadoCuentaPdfService } from '../services/estado-cuenta-pdf.service';
import { CrearPagoDto } from '../dto/crear-pago.dto';
import { PreviewPagoDto } from '../dto/preview-pago.dto';
import { AnularPagoDto } from '../dto/anular-pago.dto';
import { FiltrosPagoDto } from '../dto/filtros-pago.dto';
import { ReciboDataDto } from '../dto/recibo-data.dto';
import { Pago } from '../entities/pago.entity';

@Controller('pagos')
export class PagoController {
  constructor(
    private readonly pagoService: PagoService,
    private readonly pagoConsultaService: PagoConsultaService,
    private readonly pagoCalculoService: PagoCalculoService,
    private readonly pagoReciboService: PagoReciboService,
    private readonly estadoCuentaPdfService: EstadoCuentaPdfService,
  ) {}

  /**
   * Preview de pago sin aplicar
   * POST /api/pagos/preview
   */
  @Post('preview')
  async preview(@Body() dto: PreviewPagoDto): Promise<PreviewPagoResponse> {
    return this.pagoService.preview(dto);
  }

  /**
   * Crear y aplicar un pago
   * POST /api/pagos
   */
  @Post()
  async crear(@Body() dto: CrearPagoDto): Promise<Pago> {
    return this.pagoService.crear(dto);
  }

  /**
   * Listar pagos con filtros
   * GET /api/pagos
   */
  @Get()
  async findAll(@Query() filtros: FiltrosPagoDto): Promise<PaginatedPagos> {
    return this.pagoConsultaService.findAll(filtros);
  }

  /**
   * Listar pagos de un préstamo específico
   * GET /api/pagos/prestamo/:prestamoId
   */
  @Get('prestamo/:prestamoId')
  async findByPrestamo(
    @Param('prestamoId', ParseIntPipe) prestamoId: number,
  ): Promise<Pago[]> {
    return this.pagoConsultaService.findByPrestamo(prestamoId);
  }

  /**
   * Estado de cuenta de un préstamo
   * GET /api/pagos/prestamo/:prestamoId/estado-cuenta
   */
  @Get('prestamo/:prestamoId/estado-cuenta')
  async getEstadoCuenta(
    @Param('prestamoId', ParseIntPipe) prestamoId: number,
  ): Promise<EstadoCuenta> {
    return this.pagoConsultaService.getEstadoCuenta(prestamoId);
  }

  /**
   * Resumen de adeudo de un préstamo
   * GET /api/pagos/prestamo/:prestamoId/resumen-adeudo
   */
  @Get('prestamo/:prestamoId/resumen-adeudo')
  async getResumenAdeudo(
    @Param('prestamoId', ParseIntPipe) prestamoId: number,
  ): Promise<ResumenAdeudo> {
    return this.pagoConsultaService.getResumenAdeudo(prestamoId);
  }

  /**
   * Generar PDF del estado de cuenta de un préstamo
   * GET /api/pagos/prestamo/:prestamoId/estado-cuenta-pdf
   */
  @Get('prestamo/:prestamoId/estado-cuenta-pdf')
  async getEstadoCuentaPdf(
    @Param('prestamoId', ParseIntPipe) prestamoId: number,
    @Res() res: Response,
  ): Promise<void> {
    // Obtener datos necesarios para el nombre del archivo
    const datos = await this.estadoCuentaPdfService.obtenerDatosEstadoCuenta(prestamoId);
    const numeroCredito = datos.prestamo.numeroCredito;

    // Generar el PDF
    const pdfDoc = await this.estadoCuentaPdfService.generarPdf(prestamoId);

    // Convertir el PDF a buffer
    const chunks: Buffer[] = [];

    pdfDoc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    pdfDoc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);

      // Configurar headers de respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="estado-cuenta-${numeroCredito}.pdf"`,
      );

      // Enviar el buffer
      res.end(pdfBuffer);
    });

    pdfDoc.on('error', (error) => {
      console.error('Error generando PDF:', error);
      res.status(500).json({ message: 'Error al generar el PDF' });
    });
  }

  /**
   * Obtener datos del recibo de pago
   * GET /api/pagos/:id/recibo
   * NOTA: Este endpoint debe estar antes de :id para que no sea capturado por la ruta genérica
   */
  @Get(':id/recibo')
  async obtenerRecibo(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReciboDataDto> {
    return this.pagoReciboService.obtenerDatosRecibo(id);
  }

  /**
   * Obtener detalle de un pago
   * GET /api/pagos/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Pago> {
    return this.pagoService.findOne(id);
  }

  /**
   * Anular un pago
   * POST /api/pagos/:id/anular
   */
  @Post(':id/anular')
  async anular(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AnularPagoDto,
  ): Promise<Pago> {
    return this.pagoService.anular(id, dto);
  }
}
