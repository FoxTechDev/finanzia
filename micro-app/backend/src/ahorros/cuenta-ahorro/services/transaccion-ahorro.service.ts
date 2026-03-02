import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CuentaAhorro } from '../entities/cuenta-ahorro.entity';
import { TransaccionAhorro } from '../entities/transaccion-ahorro.entity';
import { DepositoAhorroDto, RetiroAhorroDto } from '../dto/transaccion-ahorro.dto';
import { CatalogosAhorroService } from '../../catalogos/services/catalogos-ahorro.service';
import { CuentaAhorroService } from './cuenta-ahorro.service';

@Injectable()
export class TransaccionAhorroService {
  constructor(
    @InjectRepository(TransaccionAhorro)
    private readonly transRepo: Repository<TransaccionAhorro>,
    private readonly dataSource: DataSource,
    private readonly catalogosService: CatalogosAhorroService,
    private readonly cuentaService: CuentaAhorroService,
  ) {}

  async depositar(
    cuentaId: number,
    dto: DepositoAhorroDto,
    usuarioId?: number,
    nombreUsuario?: string,
  ): Promise<TransaccionAhorro> {
    const cuenta = await this.cuentaService.findOneEntity(cuentaId);

    if (cuenta.estado?.codigo !== 'ACTIVA') {
      throw new BadRequestException('Solo se puede depositar en cuentas activas');
    }

    if (dto.monto <= 0) {
      throw new BadRequestException('El monto debe ser mayor a cero');
    }

    const naturalezaAbono =
      await this.catalogosService.findNaturalezaByCodigo('ABONO');
    const tipoDeposito =
      await this.catalogosService.findTipoTransaccionByCodigo('DEPOSITO');

    const fecha = dto.fecha || new Date().toISOString().split('T')[0];
    const saldoAnterior = Number(cuenta.saldo);
    const nuevoSaldo = saldoAnterior + dto.monto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaccion = Object.assign(new TransaccionAhorro(), {
        cuentaAhorroId: cuentaId,
        fecha,
        monto: dto.monto,
        naturalezaId: naturalezaAbono.id,
        tipoTransaccionId: tipoDeposito.id,
        saldoAnterior,
        nuevoSaldo,
        observacion: dto.observacion || 'Depósito',
        usuarioId,
        nombreUsuario,
      });
      const savedTrans = await queryRunner.manager.save(
        TransaccionAhorro,
        transaccion,
      );

      const saldoDisponible = cuenta.pignorado
        ? nuevoSaldo - Number(cuenta.montoPignorado)
        : nuevoSaldo;

      await queryRunner.manager.update(CuentaAhorro, cuentaId, {
        saldo: nuevoSaldo,
        saldoDisponible: Math.max(saldoDisponible, 0),
        fechaUltMovimiento: fecha,
      });

      await queryRunner.commitTransaction();
      return savedTrans;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async retirar(
    cuentaId: number,
    dto: RetiroAhorroDto,
    usuarioId?: number,
    nombreUsuario?: string,
  ): Promise<TransaccionAhorro> {
    const cuenta = await this.cuentaService.findOneEntity(cuentaId);

    if (cuenta.estado?.codigo !== 'ACTIVA') {
      throw new BadRequestException('Solo se puede retirar de cuentas activas');
    }

    if (dto.monto <= 0) {
      throw new BadRequestException('El monto debe ser mayor a cero');
    }

    const disponible = Number(cuenta.saldoDisponible);
    if (dto.monto > disponible) {
      throw new BadRequestException(
        `Saldo disponible insuficiente. Disponible: $${disponible.toFixed(2)}`,
      );
    }

    const naturalezaCargo =
      await this.catalogosService.findNaturalezaByCodigo('CARGO');
    const tipoRetiro =
      await this.catalogosService.findTipoTransaccionByCodigo('RETIRO');

    const fecha = dto.fecha || new Date().toISOString().split('T')[0];
    const saldoAnterior = Number(cuenta.saldo);
    const nuevoSaldo = saldoAnterior - dto.monto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaccion = Object.assign(new TransaccionAhorro(), {
        cuentaAhorroId: cuentaId,
        fecha,
        monto: dto.monto,
        naturalezaId: naturalezaCargo.id,
        tipoTransaccionId: tipoRetiro.id,
        saldoAnterior,
        nuevoSaldo,
        observacion: dto.observacion || 'Retiro',
        usuarioId,
        nombreUsuario,
      });
      const savedTrans = await queryRunner.manager.save(
        TransaccionAhorro,
        transaccion,
      );

      const saldoDisponible = cuenta.pignorado
        ? nuevoSaldo - Number(cuenta.montoPignorado)
        : nuevoSaldo;

      await queryRunner.manager.update(CuentaAhorro, cuentaId, {
        saldo: nuevoSaldo,
        saldoDisponible: Math.max(saldoDisponible, 0),
        fechaUltMovimiento: fecha,
      });

      await queryRunner.commitTransaction();
      return savedTrans;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
