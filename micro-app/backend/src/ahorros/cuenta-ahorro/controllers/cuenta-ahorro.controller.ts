import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Request,
  Res,
  Header,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Response } from 'express';
import { CuentaAhorroService } from '../services/cuenta-ahorro.service';
import { CuentaAhorroConsultaService } from '../services/cuenta-ahorro-consulta.service';
import { CapitalizacionService } from '../services/capitalizacion.service';
import { ContratoDpfService } from '../services/contrato-dpf.service';
import { ReporteInteresesPdfService } from '../services/reporte-intereses-pdf.service';
import { TipoAhorroService } from '../../tipo-ahorro/tipo-ahorro.service';
import { CreateCuentaAhorroDto } from '../dto/create-cuenta-ahorro.dto';
import { FiltrosCuentaAhorroDto } from '../dto/filtros-cuenta-ahorro.dto';

@Controller('ahorros/cuentas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CuentaAhorroController {
  constructor(
    private readonly cuentaService: CuentaAhorroService,
    private readonly consultaService: CuentaAhorroConsultaService,
    private readonly capitalizacionService: CapitalizacionService,
    private readonly contratoDpfService: ContratoDpfService,
    private readonly reporteInteresesPdfService: ReporteInteresesPdfService,
    private readonly tipoAhorroService: TipoAhorroService,
  ) {}

  @Post()
  async abrir(@Body() dto: CreateCuentaAhorroDto, @Request() req: any) {
    const cuenta = await this.cuentaService.abrir(
      dto,
      req.user?.id,
      req.user?.firstName
        ? `${req.user.firstName} ${req.user.lastName || ''}`
        : undefined,
    );

    // Generar plan de capitalización según línea
    const tipoAhorro = await this.tipoAhorroService.findOne(dto.tipoAhorroId);
    if (tipoAhorro.lineaAhorro?.codigo === 'AV') {
      await this.capitalizacionService.generarPlanAV(cuenta.id);
    } else if (tipoAhorro.lineaAhorro?.codigo === 'DPF') {
      await this.capitalizacionService.generarPlanDPF(cuenta.id);
    } else if (dto.tipoCapitalizacionId) {
      await this.capitalizacionService.generarPlan(cuenta.id);
    }

    return this.consultaService.findDetalle(cuenta.id);
  }

  @Get()
  findAll(@Query() filtros: FiltrosCuentaAhorroDto) {
    return this.consultaService.findAll(filtros);
  }

  @Get('activas-av')
  findActivasAV(@Query('personaId') personaId?: string) {
    return this.consultaService.findActivasAV(
      personaId ? parseInt(personaId, 10) : undefined,
    );
  }

  @Get('reportes/intereses-por-pagar')
  findInteresesPorPagar(
    @Query('fechaDesde') fechaDesde: string,
    @Query('fechaHasta') fechaHasta: string,
  ) {
    return this.consultaService.findInteresesPorPagar(fechaDesde, fechaHasta);
  }

  @Get('reportes/pago-intereses-dpf')
  findPagoInteresesDpf(
    @Query('fechaDesde') fechaDesde: string,
    @Query('fechaHasta') fechaHasta: string,
    @Query('cuentaId') cuentaId?: string,
  ) {
    return this.consultaService.findPagoInteresesDpf(
      fechaDesde,
      fechaHasta,
      cuentaId ? parseInt(cuentaId, 10) : undefined,
    );
  }

  @Get(':id/contrato-dpf')
  async getContratoDpf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const buffer = await this.contratoDpfService.generarContrato(id);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="Contrato_DPF_${id}.docx"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id/reporte-intereses-pdf')
  async getReporteInteresesPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const buffer = await this.reporteInteresesPdfService.generarReporte(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Reporte_Intereses_${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.consultaService.findDetalle(id);
  }

  @Get(':id/transacciones')
  findTransacciones(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.consultaService.findTransacciones(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get(':id/estado-cuenta')
  getEstadoCuenta(@Param('id', ParseIntPipe) id: number) {
    return this.consultaService.getEstadoCuenta(id);
  }

  @Get(':id/plan-capitalizacion')
  getPlanCapitalizacion(@Param('id', ParseIntPipe) id: number) {
    return this.capitalizacionService.findPlanByCuenta(id);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.cuentaService.cancelar(
      id,
      req.user?.id,
      req.user?.firstName
        ? `${req.user.firstName} ${req.user.lastName || ''}`
        : undefined,
    );
  }

  @Patch(':id/pignorar')
  pignorar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { monto?: number; despignorar?: boolean },
  ) {
    return this.cuentaService.pignorar(
      id,
      body.monto || 0,
      body.despignorar || false,
    );
  }

  @Post(':id/renovar')
  renovar(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.cuentaService.renovar(
      id,
      req.user?.id,
      req.user?.firstName
        ? `${req.user.firstName} ${req.user.lastName || ''}`
        : undefined,
    );
  }

  @Get(':id/renovaciones')
  getRenovaciones(@Param('id', ParseIntPipe) id: number) {
    return this.consultaService.findRenovaciones(id);
  }
}
