import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CuentaAhorro } from '../entities/cuenta-ahorro.entity';
import { ProvisionAhorro } from '../entities/provision-ahorro.entity';

@Injectable()
export class ProvisionService {
  private readonly logger = new Logger(ProvisionService.name);

  constructor(
    @InjectRepository(ProvisionAhorro)
    private readonly provisionRepo: Repository<ProvisionAhorro>,
    @InjectRepository(CuentaAhorro)
    private readonly cuentaRepo: Repository<CuentaAhorro>,
  ) {}

  async calcularProvisionDiaria(
    fecha?: string,
  ): Promise<{ procesados: number }> {
    const hoy = fecha || new Date().toISOString().split('T')[0];

    const cuentasActivas = await this.cuentaRepo.find({
      where: { estado: { codigo: 'ACTIVA' } },
      relations: ['estado'],
    });

    let procesados = 0;

    for (const cuenta of cuentasActivas) {
      const saldo = Number(cuenta.saldo);
      const tasaInteres = Number(cuenta.tasaInteres);

      if (saldo <= 0 || tasaInteres <= 0) continue;

      // Interés diario = saldo * tasa anual / 365
      const interesDiario = (saldo * (tasaInteres / 100)) / 365;

      // Obtener interés acumulado anterior
      const ultimaProvision = await this.provisionRepo.findOne({
        where: { cuentaAhorroId: cuenta.id },
        order: { id: 'DESC' },
      });

      const acumuladoAnterior = ultimaProvision
        ? Number(ultimaProvision.interesAcumulado)
        : 0;

      const interesAcumulado = acumuladoAnterior + interesDiario;

      const provision = this.provisionRepo.create({
        cuentaAhorroId: cuenta.id,
        fecha: hoy,
        saldo,
        tasaInteres,
        interesDiario: Math.round(interesDiario * 100) / 100,
        interesAcumulado: Math.round(interesAcumulado * 100) / 100,
      });

      await this.provisionRepo.save(provision);

      // Actualizar saldo de intereses en la cuenta
      await this.cuentaRepo.update(cuenta.id, {
        saldoInteres: Math.round(interesAcumulado * 100) / 100,
      });

      procesados++;
    }

    return { procesados };
  }

  async findProvisionesByCuenta(
    cuentaId: number,
    page: number = 1,
    limit: number = 30,
  ) {
    const [data, total] = await this.provisionRepo.findAndCount({
      where: { cuentaAhorroId: cuentaId },
      order: { fecha: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }
}
