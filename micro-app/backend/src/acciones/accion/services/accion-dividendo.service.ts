import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, LessThan } from 'typeorm';
import { Accion } from '../entities/accion.entity';
import { AccionDividendo } from '../entities/accion-dividendo.entity';
import { CuentaAhorro } from '../../../ahorros/cuenta-ahorro/entities/cuenta-ahorro.entity';
import { TransaccionAhorro } from '../../../ahorros/cuenta-ahorro/entities/transaccion-ahorro.entity';
import { CatalogosAhorroService } from '../../../ahorros/catalogos/services/catalogos-ahorro.service';
import { formatLocalDate, parseLocalDate } from '../../../common/utils/date.utils';
import { calcularInteresProrrateo } from '../../../common/utils/interes.utils';

/**
 * Paga el dividendo anual (31 de diciembre) de las acciones activas,
 * acreditando el interés prorrateado al destino que el cliente eligió en la
 * apertura: una cuenta de ahorro (se abona internamente) o un banco externo
 * (solo queda registrado en el historial, ya que la transferencia se hace
 * fuera del sistema). A diferencia de la capitalización de DPF, la
 * periodicidad es fija para todas las cuentas (no configurable) y no se
 * reinvierte en la propia acción.
 */
@Injectable()
export class AccionDividendoService {
  private readonly logger = new Logger(AccionDividendoService.name);

  constructor(
    @InjectRepository(Accion)
    private readonly accionRepo: Repository<Accion>,
    @InjectRepository(AccionDividendo)
    private readonly dividendoRepo: Repository<AccionDividendo>,
    @InjectRepository(CuentaAhorro)
    private readonly cuentaRepo: Repository<CuentaAhorro>,
    private readonly dataSource: DataSource,
    private readonly catalogosService: CatalogosAhorroService,
  ) {}

  async procesarDividendos(): Promise<{ procesados: number }> {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const corte = new Date(anioActual, 11, 31); // 31 de diciembre

    if (hoy < corte) {
      return { procesados: 0 };
    }

    const corteStr = formatLocalDate(corte);

    const candidatas = await this.accionRepo.find({
      where: [
        { activa: true, fechaUltimoPagoIntereses: IsNull() },
        {
          activa: true,
          fechaUltimoPagoIntereses: LessThan(`${anioActual}-01-01`),
        },
      ],
      relations: ['cuentaAhorroDestino'],
    });

    if (candidatas.length === 0) {
      return { procesados: 0 };
    }

    const naturalezaAbono =
      await this.catalogosService.findNaturalezaByCodigo('ABONO');
    const tipoDividendo = await this.catalogosService.findTipoTransaccionByCodigo(
      'DIVIDENDO_ACCION',
    );

    let procesados = 0;

    for (const accion of candidatas) {
      const destino = accion.cuentaAhorroDestino;
      if (!destino && !accion.bancoId) {
        this.logger.warn(
          `Acción ${accion.id} no tiene cuenta destino ni banco configurado; se omite`,
        );
        continue;
      }

      const desde = accion.fechaUltimoPagoIntereses
        ? parseLocalDate(accion.fechaUltimoPagoIntereses)
        : parseLocalDate(accion.fechaApertura);

      const interes = calcularInteresProrrateo(
        Number(accion.monto),
        Number(accion.tasaInteres),
        desde,
        corte,
      );

      if (interes <= 0) {
        await this.accionRepo.update(accion.id, {
          fechaUltimoPagoIntereses: corteStr,
        });
        continue;
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        if (destino) {
          const saldoAnterior = Number(destino.saldo);
          const nuevoSaldo = saldoAnterior + interes;
          const saldoDisponible = destino.pignorado
            ? nuevoSaldo - Number(destino.montoPignorado)
            : nuevoSaldo;

          await queryRunner.manager.save(
            TransaccionAhorro,
            Object.assign(new TransaccionAhorro(), {
              cuentaAhorroId: destino.id,
              fecha: corteStr,
              monto: interes,
              naturalezaId: naturalezaAbono.id,
              tipoTransaccionId: tipoDividendo.id,
              saldoAnterior,
              nuevoSaldo,
              observacion: `Dividendo acción ${accion.correlativo}`,
            }),
          );

          await queryRunner.manager.update(CuentaAhorro, destino.id, {
            saldo: nuevoSaldo,
            saldoDisponible: Math.max(saldoDisponible, 0),
            fechaUltMovimiento: corteStr,
          });
        }
        // Si el destino es un banco externo, la transferencia se realiza
        // fuera del sistema; solo queda el registro en accion_dividendo.

        await queryRunner.manager.save(
          AccionDividendo,
          Object.assign(new AccionDividendo(), {
            accionId: accion.id,
            fecha: corteStr,
            monto: interes,
          }),
        );

        await queryRunner.manager.update(Accion, accion.id, {
          fechaUltimoPagoIntereses: corteStr,
        });

        await queryRunner.commitTransaction();
        procesados++;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Error pagando dividendo de la acción ${accion.id}: ${error.message}`,
        );
      } finally {
        await queryRunner.release();
      }
    }

    return { procesados };
  }

  async findDividendosByAccion(accionId: number): Promise<AccionDividendo[]> {
    return this.dividendoRepo.find({
      where: { accionId },
      order: { fecha: 'DESC' },
    });
  }
}
