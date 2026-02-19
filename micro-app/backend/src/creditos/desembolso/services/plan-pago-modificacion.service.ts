import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Prestamo, EstadoPrestamo } from '../entities/prestamo.entity';
import { PlanPago, EstadoCuota } from '../entities/plan-pago.entity';
import { PlanPagoHistorial } from '../entities/plan-pago-historial.entity';
import { ModificarPlanPagoDto, PreviewPlanPagoDto } from '../dto/modificar-plan-pago.dto';
import { CalculoInteresService } from './calculo-interes.service';
import { PlanPagoService, CuotaPlanPago } from './plan-pago.service';

@Injectable()
export class PlanPagoModificacionService {
  constructor(
    @InjectRepository(Prestamo)
    private readonly prestamoRepo: Repository<Prestamo>,
    @InjectRepository(PlanPago)
    private readonly planPagoRepo: Repository<PlanPago>,
    @InjectRepository(PlanPagoHistorial)
    private readonly historialRepo: Repository<PlanPagoHistorial>,
    private readonly dataSource: DataSource,
    private readonly calculoInteresService: CalculoInteresService,
    private readonly planPagoService: PlanPagoService,
  ) {}

  /**
   * Preview: calcula el nuevo plan sin guardar nada
   */
  async previewPlanPago(prestamoId: number, dto: PreviewPlanPagoDto): Promise<{
    montoBase: number;
    cuotas: CuotaPlanPago[];
    cuotaNormal: number;
    totalInteres: number;
    totalPagar: number;
    numeroCuotas: number;
    fechaVencimiento: string;
  }> {
    const prestamo = await this.prestamoRepo.findOne({ where: { id: prestamoId } });
    if (!prestamo) {
      throw new NotFoundException(`Prestamo con ID ${prestamoId} no encontrado`);
    }

    if (prestamo.estado !== EstadoPrestamo.VIGENTE && prestamo.estado !== EstadoPrestamo.MORA) {
      throw new BadRequestException(
        `Solo se puede modificar el plan de pagos de prestamos VIGENTE o MORA. Estado actual: ${prestamo.estado}`,
      );
    }

    const montoBase = dto.usarSaldoActual
      ? Number(prestamo.saldoCapital)
      : Number(prestamo.montoDesembolsado);

    if (montoBase <= 0) {
      throw new BadRequestException('El monto base para el calculo debe ser mayor a 0');
    }

    // Calcular cuotas usando CalculoInteresService
    const resultado = dto.numeroCuotas
      ? this.calculoInteresService.calcularConCuotasPersonalizadas(
          montoBase,
          dto.tasaInteres,
          dto.plazo,
          dto.numeroCuotas,
          dto.tipoInteres,
          dto.periodicidadPago,
        )
      : this.calculoInteresService.calcular(
          montoBase,
          dto.tasaInteres,
          dto.plazo,
          dto.tipoInteres,
          dto.periodicidadPago,
        );

    // Generar plan con fechas (sin recargos)
    const cuotas = this.planPagoService.generarPlanPago(
      new Date(dto.fechaPrimeraCuota),
      dto.periodicidadPago,
      resultado.cuotas,
      [], // sin recargos
      resultado.cuotaNormal,
    );

    const fechaVencimiento = cuotas.length > 0
      ? cuotas[cuotas.length - 1].fechaVencimiento.toISOString().substring(0, 10)
      : dto.fechaPrimeraCuota;

    return {
      montoBase,
      cuotas,
      cuotaNormal: resultado.cuotaNormal,
      totalInteres: resultado.totalInteres,
      totalPagar: resultado.totalPagar,
      numeroCuotas: resultado.numeroCuotas,
      fechaVencimiento,
    };
  }

  /**
   * Modifica el plan de pagos: respalda cuotas antiguas, genera nuevas
   */
  async modificarPlanPago(dto: ModificarPlanPagoDto): Promise<{ mensaje: string; loteModificacion: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar prestamo
      const prestamo = await queryRunner.manager.findOne(Prestamo, {
        where: { id: dto.prestamoId },
      });

      if (!prestamo) {
        throw new NotFoundException(`Prestamo con ID ${dto.prestamoId} no encontrado`);
      }

      if (prestamo.estado !== EstadoPrestamo.VIGENTE && prestamo.estado !== EstadoPrestamo.MORA) {
        throw new BadRequestException(
          `Solo se puede modificar el plan de pagos de prestamos VIGENTE o MORA. Estado actual: ${prestamo.estado}`,
        );
      }

      // 2. Determinar monto base
      const montoBase = dto.usarSaldoActual
        ? Number(prestamo.saldoCapital)
        : Number(prestamo.montoDesembolsado);

      if (montoBase <= 0) {
        throw new BadRequestException('El monto base para el calculo debe ser mayor a 0');
      }

      // 3. Calcular nuevo plan
      const resultado = dto.numeroCuotas
        ? this.calculoInteresService.calcularConCuotasPersonalizadas(
            montoBase,
            dto.tasaInteres,
            dto.plazo,
            dto.numeroCuotas,
            dto.tipoInteres,
            dto.periodicidadPago,
          )
        : this.calculoInteresService.calcular(
            montoBase,
            dto.tasaInteres,
            dto.plazo,
            dto.tipoInteres,
            dto.periodicidadPago,
          );

      // 4. Generar plan con fechas
      const nuevasCuotas = this.planPagoService.generarPlanPago(
        new Date(dto.fechaPrimeraCuota),
        dto.periodicidadPago,
        resultado.cuotas,
        [],
        resultado.cuotaNormal,
      );

      // 5. Obtener cuotas actuales
      const todasLasCuotas = await queryRunner.manager.find(PlanPago, {
        where: { prestamoId: dto.prestamoId },
        order: { numeroCuota: 'ASC' },
      });

      const cuotasNoPagadas = todasLasCuotas.filter(c => c.estado !== EstadoCuota.PAGADA);

      // 6. Copiar cuotas no-PAGADA a historial
      const loteModificacion = `MOD-${dto.prestamoId}-${Date.now()}`;

      for (const cuota of cuotasNoPagadas) {
        const historial = new PlanPagoHistorial();
        historial.prestamoId = cuota.prestamoId;
        historial.loteModificacion = loteModificacion;
        historial.numeroCuota = cuota.numeroCuota;
        historial.fechaVencimiento = cuota.fechaVencimiento;
        historial.capital = cuota.capital;
        historial.interes = cuota.interes;
        historial.recargos = cuota.recargos;
        historial.cuotaTotal = cuota.cuotaTotal;
        historial.saldoCapital = cuota.saldoCapital;
        historial.capitalPagado = cuota.capitalPagado;
        historial.interesPagado = cuota.interesPagado;
        historial.recargosPagado = cuota.recargosPagado;
        historial.fechaPago = cuota.fechaPago;
        historial.diasMora = cuota.diasMora;
        historial.interesMoratorio = cuota.interesMoratorio;
        historial.interesMoratorioPagado = cuota.interesMoratorioPagado;
        historial.estado = cuota.estado;
        historial.observacion = dto.observacion;
        historial.usuarioId = dto.usuarioId ?? 0;
        historial.nombreUsuario = dto.nombreUsuario ?? '';

        await queryRunner.manager.save(PlanPagoHistorial, historial);
      }

      // 7. DELETE cuotas no-PAGADA
      const idsAEliminar = cuotasNoPagadas.map(c => c.id);
      if (idsAEliminar.length > 0) {
        await queryRunner.manager.delete(PlanPago, idsAEliminar);
      }

      // 8. Determinar numero de cuota inicial (despues de las pagadas)
      const cuotasPagadas = todasLasCuotas.filter(c => c.estado === EstadoCuota.PAGADA);
      const ultimaCuotaPagada = cuotasPagadas.length > 0
        ? Math.max(...cuotasPagadas.map(c => c.numeroCuota))
        : 0;

      // 9. INSERT nuevas cuotas
      for (const cuota of nuevasCuotas) {
        const nuevaCuota = new PlanPago();
        nuevaCuota.prestamoId = dto.prestamoId;
        nuevaCuota.numeroCuota = ultimaCuotaPagada + cuota.numeroCuota;
        nuevaCuota.fechaVencimiento = cuota.fechaVencimiento;
        nuevaCuota.capital = cuota.capital;
        nuevaCuota.interes = cuota.interes;
        nuevaCuota.recargos = cuota.recargos;
        nuevaCuota.cuotaTotal = cuota.cuotaTotal;
        nuevaCuota.saldoCapital = cuota.saldoCapital;
        nuevaCuota.capitalPagado = 0;
        nuevaCuota.interesPagado = 0;
        nuevaCuota.recargosPagado = 0;
        nuevaCuota.diasMora = 0;
        nuevaCuota.interesMoratorio = 0;
        nuevaCuota.interesMoratorioPagado = 0;
        nuevaCuota.estado = EstadoCuota.PENDIENTE;

        await queryRunner.manager.save(PlanPago, nuevaCuota);
      }

      // 10. Actualizar prestamo
      const fechaVencimiento = nuevasCuotas.length > 0
        ? nuevasCuotas[nuevasCuotas.length - 1].fechaVencimiento
        : prestamo.fechaVencimiento;

      const totalNuevoCuotas = resultado.numeroCuotas;

      await queryRunner.manager.update(Prestamo, dto.prestamoId, {
        saldoCapital: montoBase,
        saldoInteres: resultado.totalInteres,
        totalInteres: resultado.totalInteres,
        totalRecargos: 0,
        totalPagar: this.round(montoBase + resultado.totalInteres),
        cuotaNormal: resultado.cuotaNormal,
        cuotaTotal: resultado.cuotaNormal,
        numeroCuotas: ultimaCuotaPagada + totalNuevoCuotas,
        tasaInteres: dto.tasaInteres,
        periodicidadPago: dto.periodicidadPago,
        tipoInteres: dto.tipoInteres,
        plazoAutorizado: dto.plazo,
        fechaPrimeraCuota: new Date(dto.fechaPrimeraCuota),
        fechaVencimiento: fechaVencimiento,
      });

      await queryRunner.commitTransaction();

      return {
        mensaje: `Plan de pagos regenerado exitosamente. ${nuevasCuotas.length} nuevas cuotas generadas.`,
        loteModificacion,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async obtenerHistorial(prestamoId: number): Promise<any[]> {
    const registros = await this.historialRepo.find({
      where: { prestamoId },
      order: { fechaModificacion: 'DESC', numeroCuota: 'ASC' },
    });

    const lotes = new Map<string, any>();
    for (const reg of registros) {
      if (!lotes.has(reg.loteModificacion)) {
        lotes.set(reg.loteModificacion, {
          loteModificacion: reg.loteModificacion,
          fechaModificacion: reg.fechaModificacion,
          observacion: reg.observacion,
          usuarioId: reg.usuarioId,
          nombreUsuario: reg.nombreUsuario,
          cuotas: [],
        });
      }
      lotes.get(reg.loteModificacion).cuotas.push({
        numeroCuota: reg.numeroCuota,
        fechaVencimiento: reg.fechaVencimiento,
        capital: reg.capital,
        interes: reg.interes,
        recargos: reg.recargos,
        cuotaTotal: reg.cuotaTotal,
        saldoCapital: reg.saldoCapital,
        estado: reg.estado,
      });
    }

    return Array.from(lotes.values());
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
