import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CuentaAhorro } from '../entities/cuenta-ahorro.entity';
import { TransaccionAhorro } from '../entities/transaccion-ahorro.entity';
import { CreateCuentaAhorroDto } from '../dto/create-cuenta-ahorro.dto';
import { BitacoraRenovacion } from '../entities/bitacora-renovacion.entity';
import { PlanCapitalizacion } from '../entities/plan-capitalizacion.entity';
import { CatalogosAhorroService } from '../../catalogos/services/catalogos-ahorro.service';
import { TipoAhorroService } from '../../tipo-ahorro/tipo-ahorro.service';
import { CapitalizacionService } from './capitalizacion.service';
import { formatLocalDate } from '../../../common/utils/date.utils';

@Injectable()
export class CuentaAhorroService {
  constructor(
    @InjectRepository(CuentaAhorro)
    private readonly cuentaRepo: Repository<CuentaAhorro>,
    @InjectRepository(TransaccionAhorro)
    private readonly transRepo: Repository<TransaccionAhorro>,
    private readonly dataSource: DataSource,
    private readonly catalogosService: CatalogosAhorroService,
    private readonly tipoAhorroService: TipoAhorroService,
    private readonly capitalizacionService: CapitalizacionService,
  ) {}

  async abrir(
    dto: CreateCuentaAhorroDto,
    usuarioId?: number,
    nombreUsuario?: string,
  ): Promise<CuentaAhorro> {
    const tipoAhorro = await this.tipoAhorroService.findOne(dto.tipoAhorroId);
    if (!tipoAhorro.activo) {
      throw new BadRequestException('El tipo de ahorro no está activo');
    }

    if (dto.monto < Number(tipoAhorro.montoAperturaMin)) {
      throw new BadRequestException(
        `El monto mínimo de apertura es $${tipoAhorro.montoAperturaMin}`,
      );
    }

    const tasaMin = Number(tipoAhorro.tasaMin);
    const tasaMax = Number(tipoAhorro.tasaMax);
    if (dto.tasaInteres !== undefined && tasaMax > 0) {
      if (dto.tasaInteres < tasaMin) {
        throw new BadRequestException(
          `La tasa de interés no puede ser menor a ${tasaMin}%`,
        );
      }
      if (dto.tasaInteres > tasaMax) {
        throw new BadRequestException(
          `La tasa de interés no puede ser mayor a ${tasaMax}%`,
        );
      }
    }

    const estadoActiva =
      await this.catalogosService.findEstadoByCodigo('ACTIVA');
    const tipoTransApertura =
      await this.catalogosService.findTipoTransaccionByCodigo('APERTURA');
    const naturalezaAbono =
      await this.catalogosService.findNaturalezaByCodigo('ABONO');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const noCuenta = await this.generarNoCuenta();

      const tasaInteres =
        dto.tasaInteres !== undefined
          ? dto.tasaInteres
          : Number(tipoAhorro.tasaVigente);

      // Auto-asignar capitalización TRIMESTRAL para Ahorro a la Vista
      let tipoCapitalizacionId = dto.tipoCapitalizacionId || null;
      if (
        tipoAhorro.lineaAhorro?.codigo === 'AV' &&
        !tipoCapitalizacionId
      ) {
        const trimestral =
          await this.catalogosService.findTipoCapitalizacionByCodigo(
            'TRIMESTRAL',
          );
        tipoCapitalizacionId = trimestral.id;
      }

      const cuenta = Object.assign(new CuentaAhorro(), {
        noCuenta,
        personaId: dto.personaId,
        tipoAhorroId: dto.tipoAhorroId,
        estadoId: estadoActiva.id,
        tipoCapitalizacionId,
        fechaApertura: dto.fechaApertura,
        fechaVencimiento: dto.fechaVencimiento || null,
        monto: dto.monto,
        plazo: dto.plazo || 0,
        tasaInteres,
        saldo: dto.monto,
        saldoDisponible: dto.monto,
        fechaUltMovimiento: dto.fechaApertura,
        cuentaAhorroDestinoId: dto.cuentaAhorroDestinoId || null,
        bancoId: dto.bancoId || null,
        cuentaBancoNumero: dto.cuentaBancoNumero || null,
        cuentaBancoPropietario: dto.cuentaBancoPropietario || null,
      });

      const savedCuenta = await queryRunner.manager.save(CuentaAhorro, cuenta);

      const transaccion = Object.assign(new TransaccionAhorro(), {
        cuentaAhorroId: savedCuenta.id,
        fecha: dto.fechaApertura,
        monto: dto.monto,
        naturalezaId: naturalezaAbono.id,
        tipoTransaccionId: tipoTransApertura.id,
        saldoAnterior: 0,
        nuevoSaldo: dto.monto,
        observacion: dto.observacion || 'Apertura de cuenta',
        usuarioId,
        nombreUsuario,
      });

      await queryRunner.manager.save(TransaccionAhorro, transaccion);

      await queryRunner.commitTransaction();

      return this.findOneEntity(savedCuenta.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelar(
    id: number,
    usuarioId?: number,
    nombreUsuario?: string,
  ): Promise<CuentaAhorro> {
    const cuenta = await this.findOneEntity(id);

    if (cuenta.estado?.codigo === 'CANCELADA') {
      throw new BadRequestException('La cuenta ya está cancelada');
    }

    const estadoCancelada =
      await this.catalogosService.findEstadoByCodigo('CANCELADA');
    const tipoTransCancelacion =
      await this.catalogosService.findTipoTransaccionByCodigo('CANCELACION');
    const naturalezaCargo =
      await this.catalogosService.findNaturalezaByCodigo('CARGO');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const saldoAnterior = Number(cuenta.saldo);
      const hoy = formatLocalDate(new Date());

      if (saldoAnterior > 0) {
        const transaccion = Object.assign(new TransaccionAhorro(), {
          cuentaAhorroId: id,
          fecha: hoy,
          monto: saldoAnterior,
          naturalezaId: naturalezaCargo.id,
          tipoTransaccionId: tipoTransCancelacion.id,
          saldoAnterior,
          nuevoSaldo: 0,
          observacion: 'Cancelación de cuenta',
          usuarioId,
          nombreUsuario,
        });
        await queryRunner.manager.save(TransaccionAhorro, transaccion);
      }

      await queryRunner.manager.update(CuentaAhorro, id, {
        estadoId: estadoCancelada.id,
        saldo: 0,
        saldoDisponible: 0,
        fechaCancelacion: hoy,
        fechaUltMovimiento: hoy,
      });

      await queryRunner.commitTransaction();
      return this.findOneEntity(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async pignorar(
    id: number,
    monto: number,
    despignorar: boolean = false,
  ): Promise<CuentaAhorro> {
    const cuenta = await this.findOneEntity(id);

    if (despignorar) {
      await this.cuentaRepo.update(id, {
        pignorado: false,
        montoPignorado: 0,
        saldoDisponible: Number(cuenta.saldo),
      });
    } else {
      if (monto > Number(cuenta.saldo)) {
        throw new BadRequestException(
          'El monto a pignorar no puede ser mayor al saldo',
        );
      }
      await this.cuentaRepo.update(id, {
        pignorado: true,
        montoPignorado: monto,
        saldoDisponible: Number(cuenta.saldo) - monto,
      });
    }

    return this.findOneEntity(id);
  }

  async renovar(
    id: number,
    usuarioId?: number,
    nombreUsuario?: string,
  ): Promise<CuentaAhorro> {
    const cuenta = await this.findOneEntity(id);

    if (!cuenta.fechaVencimiento) {
      throw new BadRequestException(
        'Solo se pueden renovar cuentas con fecha de vencimiento',
      );
    }

    if (!cuenta.plazo || cuenta.plazo <= 0) {
      throw new BadRequestException(
        'La cuenta no tiene un plazo definido para renovar',
      );
    }

    // Calcular nuevo vencimiento: fechaVencimiento actual + plazo días
    const vencimientoAnterior = new Date(cuenta.fechaVencimiento);
    const nuevoVencimiento = new Date(vencimientoAnterior);
    nuevoVencimiento.setDate(nuevoVencimiento.getDate() + cuenta.plazo);
    const nuevoVencimientoStr = formatLocalDate(nuevoVencimiento);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Registrar en bitácora de renovación
      const bitacora = Object.assign(new BitacoraRenovacion(), {
        cuentaAhorroId: id,
        fechaRenovacion: formatLocalDate(new Date()),
        vencimientoAnterior: cuenta.fechaVencimiento,
        nuevoVencimiento: nuevoVencimientoStr,
        usuarioId,
        nombreUsuario,
      });
      await queryRunner.manager.save(BitacoraRenovacion, bitacora);

      // 2. Actualizar fecha de vencimiento y estado
      const estadoActiva =
        await this.catalogosService.findEstadoByCodigo('ACTIVA');

      await queryRunner.manager.update(CuentaAhorro, id, {
        fechaVencimiento: nuevoVencimientoStr,
        estadoId: estadoActiva.id,
      });

      // 3. Eliminar plan de capitalización no procesado
      await queryRunner.manager.delete(PlanCapitalizacion, {
        cuentaAhorroId: id,
        procesado: false,
      });

      // 4. Generar nuevo plan de capitalización
      //    Usamos la fecha de vencimiento anterior como fecha de inicio
      const nuevoPlan =
        await this.capitalizacionService.generarPlanDPFDesde(
          id,
          vencimientoAnterior,
          nuevoVencimiento,
        );
      if (nuevoPlan.length > 0) {
        await queryRunner.manager.save(PlanCapitalizacion, nuevoPlan);
      }

      await queryRunner.commitTransaction();
      return this.findOneEntity(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOneEntity(id: number): Promise<CuentaAhorro> {
    const cuenta = await this.cuentaRepo.findOne({
      where: { id },
      relations: [
        'persona',
        'tipoAhorro',
        'tipoAhorro.lineaAhorro',
        'estado',
        'tipoCapitalizacion',
      ],
    });
    if (!cuenta) {
      throw new NotFoundException(`Cuenta de ahorro ID ${id} no encontrada`);
    }
    return cuenta;
  }

  private async generarNoCuenta(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `AH${year}`;

    const result = await this.cuentaRepo
      .createQueryBuilder('c')
      .select('MAX(c.noCuenta)', 'max')
      .where('c.noCuenta LIKE :prefix', { prefix: `${prefix}%` })
      .getRawOne();

    let seq = 1;
    if (result?.max) {
      const lastSeq = parseInt(result.max.replace(prefix, ''), 10);
      seq = lastSeq + 1;
    }

    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }
}
