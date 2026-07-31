import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual } from 'typeorm';
import { CuentaAhorro } from '../entities/cuenta-ahorro.entity';
import { PlanCapitalizacion } from '../entities/plan-capitalizacion.entity';
import { TransaccionAhorro } from '../entities/transaccion-ahorro.entity';
import { CatalogosAhorroService } from '../../catalogos/services/catalogos-ahorro.service';
import { formatLocalDate, parseLocalDate } from '../../../common/utils/date.utils';
import { calcularInteresProrrateo } from '../../../common/utils/interes.utils';

@Injectable()
export class CapitalizacionService {
  private readonly logger = new Logger(CapitalizacionService.name);

  constructor(
    @InjectRepository(PlanCapitalizacion)
    private readonly planRepo: Repository<PlanCapitalizacion>,
    @InjectRepository(CuentaAhorro)
    private readonly cuentaRepo: Repository<CuentaAhorro>,
    private readonly dataSource: DataSource,
    private readonly catalogosService: CatalogosAhorroService,
  ) {}

  async generarPlan(cuentaId: number): Promise<PlanCapitalizacion[]> {
    const cuenta = await this.cuentaRepo.findOne({
      where: { id: cuentaId },
      relations: ['tipoCapitalizacion'],
    });

    if (!cuenta || !cuenta.tipoCapitalizacionId || !cuenta.fechaVencimiento) {
      return [];
    }

    const dias = cuenta.tipoCapitalizacion?.dias || 30;
    if (dias === 0) {
      // Al vencimiento: solo una fecha
      const plan = this.planRepo.create({
        cuentaAhorroId: cuentaId,
        fechaCapitalizacion: cuenta.fechaVencimiento,
      });
      return this.planRepo.save([plan]);
    }

    const fechas: PlanCapitalizacion[] = [];
    const inicio = parseLocalDate(cuenta.fechaApertura);
    const fin = parseLocalDate(cuenta.fechaVencimiento);

    let fecha = new Date(inicio);
    fecha.setDate(fecha.getDate() + dias);

    while (fecha <= fin) {
      fechas.push(
        this.planRepo.create({
          cuentaAhorroId: cuentaId,
          fechaCapitalizacion: formatLocalDate(fecha),
        }),
      );
      fecha = new Date(fecha);
      fecha.setDate(fecha.getDate() + dias);
    }

    if (fechas.length > 0) {
      return this.planRepo.save(fechas);
    }
    return [];
  }

  async procesarCapitalizacion(): Promise<{ procesados: number }> {
    const hoy = formatLocalDate(new Date());

    const pendientes = await this.planRepo.find({
      where: {
        procesado: false,
        fechaCapitalizacion: LessThanOrEqual(new Date(hoy)),
      },
      relations: ['cuentaAhorro'],
    });

    if (pendientes.length === 0) {
      return { procesados: 0 };
    }

    const naturalezaAbono =
      await this.catalogosService.findNaturalezaByCodigo('ABONO');
    const tipoCap =
      await this.catalogosService.findTipoTransaccionByCodigo('CAPITALIZACION');

    let procesados = 0;

    for (const plan of pendientes) {
      const cuenta = plan.cuentaAhorro;
      if (!cuenta || cuenta.estadoId === undefined) continue;

      const saldoInteres = Number(cuenta.saldoInteres);
      if (saldoInteres <= 0) {
        await this.planRepo.update(plan.id, {
          procesado: true,
          fechaProcesado: hoy,
          monto: 0,
        });
        continue;
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const saldoAnterior = Number(cuenta.saldo);
        const nuevoSaldo = saldoAnterior + saldoInteres;

        const transaccion = Object.assign(new TransaccionAhorro(), {
          cuentaAhorroId: cuenta.id,
          fecha: hoy,
          monto: saldoInteres,
          naturalezaId: naturalezaAbono.id,
          tipoTransaccionId: tipoCap.id,
          saldoAnterior,
          nuevoSaldo,
          observacion: `Capitalización de intereses`,
        });
        await queryRunner.manager.save(TransaccionAhorro, transaccion);

        const saldoDisponible = cuenta.pignorado
          ? nuevoSaldo - Number(cuenta.montoPignorado)
          : nuevoSaldo;

        await queryRunner.manager.update(CuentaAhorro, cuenta.id, {
          saldo: nuevoSaldo,
          saldoDisponible: Math.max(saldoDisponible, 0),
          saldoInteres: 0,
          fechaUltMovimiento: hoy,
        });

        await queryRunner.manager.update(PlanCapitalizacion, plan.id, {
          procesado: true,
          fechaProcesado: hoy,
          monto: saldoInteres,
        });

        await queryRunner.commitTransaction();
        procesados++;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Error capitalizando cuenta ${cuenta.id}: ${error.message}`,
        );
      } finally {
        await queryRunner.release();
      }
    }

    return { procesados };
  }

  /**
   * Paga de inmediato (mismo día) el interés de un DPF con capitalización
   * "Pago Anticipado". A diferencia de procesarCapitalizacion(), el interés
   * NO se reinvierte en el saldo del propio DPF: se acredita a la cuenta AV
   * o banco que el cliente eligió en la apertura, o se registra como pagado
   * en efectivo si no eligió ninguno.
   */
  async procesarPagoAnticipado(cuentaId: number): Promise<void> {
    const plan = await this.planRepo.findOne({
      where: { cuentaAhorroId: cuentaId, procesado: false },
      order: { fechaCapitalizacion: 'ASC' },
    });
    if (!plan) return;

    const cuenta = await this.cuentaRepo.findOne({
      where: { id: cuentaId },
      relations: ['cuentaAhorroDestino', 'banco'],
    });
    if (!cuenta) return;

    const interes = Number(plan.monto);
    // Se ancla a la fecha de apertura del DPF (no a "hoy"), ya que el pago
    // anticipado se considera efectuado el día de apertura del contrato.
    const fechaPago = formatLocalDate(parseLocalDate(cuenta.fechaApertura));
    const naturalezaAbono =
      await this.catalogosService.findNaturalezaByCodigo('ABONO');
    const tipoPagoIntereses =
      await this.catalogosService.findTipoTransaccionByCodigo(
        'PAGO_INTERESES',
      );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let observacionDpf = 'Pago anticipado de intereses en efectivo';

      if (cuenta.cuentaAhorroDestino) {
        const destino = cuenta.cuentaAhorroDestino;
        const saldoAnteriorDestino = Number(destino.saldo);
        const nuevoSaldoDestino = saldoAnteriorDestino + interes;
        const saldoDisponibleDestino = destino.pignorado
          ? nuevoSaldoDestino - Number(destino.montoPignorado)
          : nuevoSaldoDestino;

        await queryRunner.manager.save(
          TransaccionAhorro,
          Object.assign(new TransaccionAhorro(), {
            cuentaAhorroId: destino.id,
            fecha: fechaPago,
            monto: interes,
            naturalezaId: naturalezaAbono.id,
            tipoTransaccionId: tipoPagoIntereses.id,
            saldoAnterior: saldoAnteriorDestino,
            nuevoSaldo: nuevoSaldoDestino,
            observacion: `Pago anticipado de intereses DPF ${cuenta.noCuenta}`,
          }),
        );

        await queryRunner.manager.update(CuentaAhorro, destino.id, {
          saldo: nuevoSaldoDestino,
          saldoDisponible: Math.max(saldoDisponibleDestino, 0),
          fechaUltMovimiento: fechaPago,
        });

        observacionDpf = `Pago anticipado de intereses transferido a cuenta ${destino.noCuenta}`;
      } else if (cuenta.banco) {
        observacionDpf = `Pago anticipado de intereses transferido al banco ${cuenta.banco.nombre}, cuenta ${cuenta.cuentaBancoNumero || ''}`.trim();
      }

      // Registro informativo en la propia cuenta DPF: el interés no forma
      // parte de su saldo, ya que se pagó de inmediato a otro destino.
      const saldoDpf = Number(cuenta.saldo);
      await queryRunner.manager.save(
        TransaccionAhorro,
        Object.assign(new TransaccionAhorro(), {
          cuentaAhorroId: cuenta.id,
          fecha: fechaPago,
          monto: interes,
          naturalezaId: naturalezaAbono.id,
          tipoTransaccionId: tipoPagoIntereses.id,
          saldoAnterior: saldoDpf,
          nuevoSaldo: saldoDpf,
          observacion: observacionDpf,
        }),
      );

      await queryRunner.manager.update(PlanCapitalizacion, plan.id, {
        procesado: true,
        fechaProcesado: fechaPago,
        monto: interes,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error en pago anticipado de intereses, cuenta ${cuentaId}: ${error.message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async generarPlanAV(cuentaId: number): Promise<PlanCapitalizacion[]> {
    const cuenta = await this.cuentaRepo.findOne({
      where: { id: cuentaId },
    });
    if (!cuenta) return [];

    // Fechas fijas de capitalización trimestral: 31 Mar, 30 Jun, 30 Sep, 31 Dec
    const fechasFijas = [
      { mes: 2, dia: 31 }, // Marzo (0-indexed)
      { mes: 5, dia: 30 }, // Junio
      { mes: 8, dia: 30 }, // Septiembre
      { mes: 11, dia: 31 }, // Diciembre
    ];

    const apertura = parseLocalDate(cuenta.fechaApertura);
    const anioApertura = apertura.getFullYear();
    const fechas: PlanCapitalizacion[] = [];

    // Generar fechas restantes del año de apertura
    for (const f of fechasFijas) {
      const fecha = new Date(anioApertura, f.mes, f.dia);
      if (fecha > apertura) {
        fechas.push(
          this.planRepo.create({
            cuentaAhorroId: cuentaId,
            fechaCapitalizacion: formatLocalDate(fecha),
          }),
        );
      }
    }

    // Generar las 4 fechas del año siguiente
    for (const f of fechasFijas) {
      const fecha = new Date(anioApertura + 1, f.mes, f.dia);
      fechas.push(
        this.planRepo.create({
          cuentaAhorroId: cuentaId,
          fechaCapitalizacion: formatLocalDate(fecha),
        }),
      );
    }

    if (fechas.length > 0) {
      return this.planRepo.save(fechas);
    }
    return [];
  }

  async generarPlanDPF(cuentaId: number): Promise<PlanCapitalizacion[]> {
    const cuenta = await this.cuentaRepo.findOne({
      where: { id: cuentaId },
      relations: ['tipoCapitalizacion'],
    });

    if (!cuenta || !cuenta.tipoCapitalizacionId || !cuenta.fechaVencimiento) {
      return [];
    }

    const saldo = Number(cuenta.monto);
    const tasaAnual = Number(cuenta.tasaInteres);
    const apertura = parseLocalDate(cuenta.fechaApertura);
    const vencimiento = parseLocalDate(cuenta.fechaVencimiento);
    const diasCap = cuenta.tipoCapitalizacion?.dias || 0;

    const fechas: PlanCapitalizacion[] = [];

    if (cuenta.tipoCapitalizacion?.codigo === 'ANTICIPADO') {
      // Pago anticipado: interés de todo el plazo, en la fecha de apertura
      const interes = calcularInteresProrrateo(
        saldo,
        tasaAnual,
        apertura,
        vencimiento,
      );
      fechas.push(
        this.planRepo.create({
          cuentaAhorroId: cuentaId,
          fechaCapitalizacion: formatLocalDate(apertura),
          monto: interes,
        }),
      );
    } else if (diasCap === 0) {
      // Al vencimiento: una sola entrada
      const interes = calcularInteresProrrateo(
        saldo,
        tasaAnual,
        apertura,
        vencimiento,
      );
      fechas.push(
        this.planRepo.create({
          cuentaAhorroId: cuentaId,
          fechaCapitalizacion: formatLocalDate(vencimiento),
          monto: interes,
        }),
      );
    } else {
      // Mensual u otro: cada N días
      let fechaAnterior = new Date(apertura);
      let fechaActual = new Date(apertura);
      fechaActual.setDate(fechaActual.getDate() + diasCap);

      while (fechaActual <= vencimiento) {
        const interes = calcularInteresProrrateo(
          saldo,
          tasaAnual,
          fechaAnterior,
          fechaActual,
        );
        fechas.push(
          this.planRepo.create({
            cuentaAhorroId: cuentaId,
            fechaCapitalizacion: formatLocalDate(fechaActual),
            monto: interes,
          }),
        );
        fechaAnterior = new Date(fechaActual);
        fechaActual = new Date(fechaActual);
        fechaActual.setDate(fechaActual.getDate() + diasCap);
      }

      // Período residual si queda entre último corte y vencimiento
      if (fechaAnterior < vencimiento) {
        const interes = calcularInteresProrrateo(
          saldo,
          tasaAnual,
          fechaAnterior,
          vencimiento,
        );
        fechas.push(
          this.planRepo.create({
            cuentaAhorroId: cuentaId,
            fechaCapitalizacion: formatLocalDate(vencimiento),
            monto: interes,
          }),
        );
      }
    }

    if (fechas.length > 0) {
      return this.planRepo.save(fechas);
    }
    return [];
  }

  /**
   * Genera plan de capitalización para un DPF renovado,
   * usando fechas de inicio y fin personalizadas.
   * Retorna las entidades SIN guardar (para usar dentro de una transacción externa).
   */
  async generarPlanDPFDesde(
    cuentaId: number,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<PlanCapitalizacion[]> {
    const cuenta = await this.cuentaRepo.findOne({
      where: { id: cuentaId },
      relations: ['tipoCapitalizacion'],
    });

    if (!cuenta || !cuenta.tipoCapitalizacionId) {
      return [];
    }

    const saldo = Number(cuenta.saldo) || Number(cuenta.monto);
    const tasaAnual = Number(cuenta.tasaInteres);
    const diasCap = cuenta.tipoCapitalizacion?.dias || 0;

    const fechas: PlanCapitalizacion[] = [];

    if (cuenta.tipoCapitalizacion?.codigo === 'ANTICIPADO') {
      // Pago anticipado: interés de todo el nuevo plazo, en la fecha de inicio
      const interes = calcularInteresProrrateo(
        saldo,
        tasaAnual,
        fechaInicio,
        fechaFin,
      );
      fechas.push(
        this.planRepo.create({
          cuentaAhorroId: cuentaId,
          fechaCapitalizacion: formatLocalDate(fechaInicio),
          monto: interes,
        }),
      );
    } else if (diasCap === 0) {
      // Al vencimiento: una sola entrada
      const interes = calcularInteresProrrateo(
        saldo,
        tasaAnual,
        fechaInicio,
        fechaFin,
      );
      fechas.push(
        this.planRepo.create({
          cuentaAhorroId: cuentaId,
          fechaCapitalizacion: formatLocalDate(fechaFin),
          monto: interes,
        }),
      );
    } else {
      // Periódico (mensual, etc.)
      let fechaAnterior = new Date(fechaInicio);
      let fechaActual = new Date(fechaInicio);
      fechaActual.setDate(fechaActual.getDate() + diasCap);

      while (fechaActual <= fechaFin) {
        const interes = calcularInteresProrrateo(
          saldo,
          tasaAnual,
          fechaAnterior,
          fechaActual,
        );
        fechas.push(
          this.planRepo.create({
            cuentaAhorroId: cuentaId,
            fechaCapitalizacion: formatLocalDate(fechaActual),
            monto: interes,
          }),
        );
        fechaAnterior = new Date(fechaActual);
        fechaActual = new Date(fechaActual);
        fechaActual.setDate(fechaActual.getDate() + diasCap);
      }

      // Período residual
      if (fechaAnterior < fechaFin) {
        const interes = calcularInteresProrrateo(
          saldo,
          tasaAnual,
          fechaAnterior,
          fechaFin,
        );
        fechas.push(
          this.planRepo.create({
            cuentaAhorroId: cuentaId,
            fechaCapitalizacion: formatLocalDate(fechaFin),
            monto: interes,
          }),
        );
      }
    }

    return fechas;
  }

  async findPlanByCuenta(cuentaId: number): Promise<PlanCapitalizacion[]> {
    return this.planRepo.find({
      where: { cuentaAhorroId: cuentaId },
      order: { fechaCapitalizacion: 'ASC' },
    });
  }
}
