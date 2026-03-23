import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual } from 'typeorm';
import { CuentaAhorro } from '../entities/cuenta-ahorro.entity';
import { PlanCapitalizacion } from '../entities/plan-capitalizacion.entity';
import { TransaccionAhorro } from '../entities/transaccion-ahorro.entity';
import { CatalogosAhorroService } from '../../catalogos/services/catalogos-ahorro.service';
import { formatLocalDate } from '../../../common/utils/date.utils';

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
    const inicio = new Date(cuenta.fechaApertura);
    const fin = new Date(cuenta.fechaVencimiento);

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

    const apertura = new Date(cuenta.fechaApertura);
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
    const apertura = new Date(cuenta.fechaApertura);
    const vencimiento = new Date(cuenta.fechaVencimiento);
    const diasCap = cuenta.tipoCapitalizacion?.dias || 0;

    const fechas: PlanCapitalizacion[] = [];

    if (diasCap === 0) {
      // Al vencimiento: una sola entrada
      const interes = this.calcularInteresProrrateo(
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
        const interes = this.calcularInteresProrrateo(
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
        const interes = this.calcularInteresProrrateo(
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

  private esAnioBisiesto(anio: number): boolean {
    return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
  }

  private calcularInteresProrrateo(
    saldo: number,
    tasaAnual: number,
    fechaInicio: Date,
    fechaFin: Date,
  ): number {
    const tasa = tasaAnual / 100;
    let interes = 0;
    let current = new Date(fechaInicio);

    while (current < fechaFin) {
      const anio = current.getFullYear();
      const diasAnio = this.esAnioBisiesto(anio) ? 366 : 365;

      const finAnio = new Date(anio + 1, 0, 1); // 1 enero del siguiente
      const endDate = fechaFin < finAnio ? fechaFin : finAnio;

      const dias = Math.round(
        (endDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24),
      );
      interes += ((saldo * tasa) / diasAnio) * dias;

      current = new Date(endDate);
    }

    return Math.round(interes * 100) / 100;
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

    if (diasCap === 0) {
      // Al vencimiento: una sola entrada
      const interes = this.calcularInteresProrrateo(
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
        const interes = this.calcularInteresProrrateo(
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
        const interes = this.calcularInteresProrrateo(
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
