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
import { PagoDetalleCuota } from '../../pagos/entities/pago-detalle-cuota.entity';
import { Pago, EstadoPago } from '../../pagos/entities/pago.entity';
import { ModificarPlanPagoDto, PreviewPlanPagoDto } from '../dto/modificar-plan-pago.dto';
import { CalculoInteresService } from './calculo-interes.service';
import { PlanPagoService, CuotaPlanPago } from './plan-pago.service';
import { parseLocalDate, formatLocalDate } from '../../../common/utils/date.utils';

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
      parseLocalDate(dto.fechaPrimeraCuota),
      dto.periodicidadPago,
      resultado.cuotas,
      [], // sin recargos
      resultado.cuotaNormal,
    );

    const fechaVencimiento = cuotas.length > 0
      ? formatLocalDate(cuotas[cuotas.length - 1].fechaVencimiento)
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
        parseLocalDate(dto.fechaPrimeraCuota),
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

      // 6. Copiar TODAS las cuotas a historial (snapshot completo del plan anterior)
      const loteModificacion = `MOD-${dto.prestamoId}-${Date.now()}`;

      for (const cuota of todasLasCuotas) {
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

      // 7. DELETE TODOS los detalles de pago y TODAS las cuotas del plan anterior.
      //    Los registros Pago se mantienen intactos; la redistribución los re-vincula
      //    con las cuotas del nuevo plan en el paso 9.5.
      const idsAEliminar = todasLasCuotas.map(c => c.id);
      if (idsAEliminar.length > 0) {
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(PagoDetalleCuota)
          .where('planPagoId IN (:...ids)', { ids: idsAEliminar })
          .execute();

        await queryRunner.manager.delete(PlanPago, idsAEliminar);
      }

      // 9. INSERT nuevas cuotas (numeroCuota empieza en 1;
      //    la redistribución marcará las ya cubiertas por pagos previos)
      for (const cuota of nuevasCuotas) {
        const nuevaCuota = new PlanPago();
        nuevaCuota.prestamoId = dto.prestamoId;
        nuevaCuota.numeroCuota = cuota.numeroCuota;
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

      // 9.5 Redistribuir SIEMPRE los pagos existentes sobre el nuevo plan.
      //     Independientemente de usarSaldoActual, los pagos ya registrados deben
      //     aplicarse al nuevo plan para que los saldos queden correctos.
      const saldos = await this.redistribuirPagosEnNuevoPlan(dto.prestamoId, queryRunner);
      const nuevoSaldoCapital = saldos.saldoCapital;
      const nuevoSaldoInteres = saldos.saldoInteres;

      // 10. Actualizar prestamo
      const fechaVencimiento = nuevasCuotas.length > 0
        ? nuevasCuotas[nuevasCuotas.length - 1].fechaVencimiento
        : prestamo.fechaVencimiento;

      const totalNuevoCuotas = resultado.numeroCuotas;

      await queryRunner.manager.update(Prestamo, dto.prestamoId, {
        totalInteres: resultado.totalInteres,
        totalRecargos: 0,
        totalPagar: this.round(montoBase + resultado.totalInteres),
        cuotaNormal: resultado.cuotaNormal,
        cuotaTotal: resultado.cuotaNormal,
        numeroCuotas: totalNuevoCuotas,
        tasaInteres: dto.tasaInteres,
        periodicidadPago: dto.periodicidadPago,
        tipoInteres: dto.tipoInteres,
        plazoAutorizado: dto.plazo,
        fechaPrimeraCuota: parseLocalDate(dto.fechaPrimeraCuota),
        fechaVencimiento: fechaVencimiento,
        saldoCapital: nuevoSaldoCapital,
        saldoInteres: nuevoSaldoInteres,
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

  /**
   * Re-aplica los pagos APLICADOS existentes sobre las cuotas del nuevo plan
   * (de menor a mayor numeroCuota) usando la misma prioridad que el proceso de cobro:
   * interés → recargos → capital.
   *
   * Crea nuevos registros PagoDetalleCuota vinculando cada Pago con las cuotas
   * del nuevo plan que "cubre", y actualiza el estado de las cuotas afectadas.
   *
   * Retorna los saldos pendientes (capital e interés) que quedan en el nuevo plan
   * después de aplicar todos los pagos históricos.
   */
  private async redistribuirPagosEnNuevoPlan(
    prestamoId: number,
    queryRunner: any,
  ): Promise<{ saldoCapital: number; saldoInteres: number }> {
    // Pagos válidos en orden cronológico
    const pagosAplicados: Pago[] = await queryRunner.manager.find(Pago, {
      where: { prestamoId, estado: EstadoPago.APLICADO },
      order: { fechaPago: 'ASC', id: 'ASC' },
    });

    // Cuotas recién insertadas del nuevo plan
    const nuevasCuotas: PlanPago[] = await queryRunner.manager.find(PlanPago, {
      where: { prestamoId },
      order: { numeroCuota: 'ASC' },
    });

    if (nuevasCuotas.length === 0) return { saldoCapital: 0, saldoInteres: 0 };

    if (pagosAplicados.length === 0) {
      return {
        saldoCapital: this.round(nuevasCuotas.reduce((s, c) => s + Number(c.capital), 0)),
        saldoInteres: this.round(nuevasCuotas.reduce((s, c) => s + Number(c.interes), 0)),
      };
    }

    // Seguimiento de cuánto queda por cubrir en cada cuota
    const cuotasSaldo = nuevasCuotas.map(c => ({
      cuota: c,
      capitalRestante: this.round(Number(c.capital)),
      interesRestante: this.round(Number(c.interes)),
      recargosRestante: this.round(Number(c.recargos)),
      capitalPagado: 0,
      interesPagado: 0,
      recargosPagado: 0,
    }));

    let cuotaIdx = 0;

    for (const pago of pagosAplicados) {
      let disponible = this.round(Number(pago.montoPagado));

      const detallesPago: Array<{
        cuotaId: number;
        numeroCuota: number;
        capitalAplicado: number;
        interesAplicado: number;
        recargosAplicado: number;
      }> = [];

      while (disponible > 0.005 && cuotaIdx < cuotasSaldo.length) {
        const cs = cuotasSaldo[cuotaIdx];

        // 1) Interés
        const interesAplicar = this.round(Math.min(disponible, cs.interesRestante));
        cs.interesRestante = this.round(cs.interesRestante - interesAplicar);
        cs.interesPagado   = this.round(cs.interesPagado   + interesAplicar);
        disponible         = this.round(disponible - interesAplicar);

        // 2) Recargos
        const recargosAplicar = this.round(Math.min(disponible, cs.recargosRestante));
        cs.recargosRestante = this.round(cs.recargosRestante - recargosAplicar);
        cs.recargosPagado   = this.round(cs.recargosPagado   + recargosAplicar);
        disponible          = this.round(disponible - recargosAplicar);

        // 3) Capital
        const capitalAplicar = this.round(Math.min(disponible, cs.capitalRestante));
        cs.capitalRestante = this.round(cs.capitalRestante - capitalAplicar);
        cs.capitalPagado   = this.round(cs.capitalPagado   + capitalAplicar);
        disponible         = this.round(disponible - capitalAplicar);

        if (capitalAplicar > 0 || interesAplicar > 0 || recargosAplicar > 0) {
          detallesPago.push({
            cuotaId: cs.cuota.id,
            numeroCuota: cs.cuota.numeroCuota,
            capitalAplicado: capitalAplicar,
            interesAplicado: interesAplicar,
            recargosAplicado: recargosAplicar,
          });
        }

        // Si la cuota quedó cubierta, avanzar a la siguiente
        if (cs.capitalRestante < 0.005 && cs.interesRestante < 0.005 && cs.recargosRestante < 0.005) {
          cs.capitalRestante  = 0;
          cs.interesRestante  = 0;
          cs.recargosRestante = 0;
          cuotaIdx++;
        }
        // Si no está cubierta, el disponible ya es 0 y el while terminará
      }

      // Registrar cómo este pago se aplicó a las cuotas del nuevo plan
      for (const d of detallesPago) {
        const det = new PagoDetalleCuota();
        det.pagoId                     = pago.id;
        det.planPagoId                 = d.cuotaId;
        det.numeroCuota                = d.numeroCuota;
        det.capitalAplicado            = d.capitalAplicado;
        det.interesAplicado            = d.interesAplicado;
        det.recargosAplicado           = d.recargosAplicado;
        det.interesMoratorioAplicado   = 0;
        det.estadoCuotaAnterior        = EstadoCuota.PENDIENTE;
        det.capitalPagadoAnterior      = 0;
        det.interesPagadoAnterior      = 0;
        det.recargosPagadoAnterior     = 0;
        det.interesMoratorioPagadoAnterior = 0;
        det.diasMoraAnterior           = 0;
        det.estadoCuotaPosterior       = EstadoCuota.PENDIENTE; // se corrige más abajo
        await queryRunner.manager.save(PagoDetalleCuota, det);
      }
    }

    // Actualizar estado y montos pagados en cada cuota
    for (const cs of cuotasSaldo) {
      const cubierta = cs.capitalRestante < 0.005 && cs.interesRestante < 0.005;
      const conPago  = cs.capitalPagado > 0.001 || cs.interesPagado > 0.001;

      const estadoFinal = cubierta
        ? EstadoCuota.PAGADA
        : conPago
        ? EstadoCuota.PARCIAL
        : EstadoCuota.PENDIENTE;

      if (estadoFinal !== EstadoCuota.PENDIENTE) {
        await queryRunner.manager.update(PlanPago, cs.cuota.id, {
          capitalPagado:  cs.capitalPagado,
          interesPagado:  cs.interesPagado,
          recargosPagado: cs.recargosPagado,
          estado:         estadoFinal,
        });

        // Actualizar estado posterior en los detalles de pago de esta cuota
        await queryRunner.manager
          .createQueryBuilder()
          .update(PagoDetalleCuota)
          .set({ estadoCuotaPosterior: estadoFinal })
          .where('planPagoId = :id', { id: cs.cuota.id })
          .execute();
      }
    }

    return {
      saldoCapital: this.round(cuotasSaldo.reduce((s, cs) => s + cs.capitalRestante, 0)),
      saldoInteres: this.round(cuotasSaldo.reduce((s, cs) => s + cs.interesRestante, 0)),
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
