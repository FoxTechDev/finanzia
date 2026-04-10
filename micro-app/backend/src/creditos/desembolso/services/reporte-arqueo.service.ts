import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from '../../pagos/entities/pago.entity';
import { Prestamo } from '../entities/prestamo.entity';
import { parseLocalDate } from '../../../common/utils/date.utils';

export interface ArqueoParams {
  fechaDesde: string;
  fechaHasta: string;
}

export interface ArqueoDiaPagos {
  fecha: string;
  cantidad: number;
  monto: number;
}

export interface ArqueoDiaDesembolsos {
  fecha: string;
  cantidad: number;
  montoDesembolsado: number;
  fondosPropios: number;
  transferenciaBancaria: number;
}

export interface ArqueoResponse {
  fechaDesde: string;
  fechaHasta: string;
  pagosPorDia: ArqueoDiaPagos[];
  totalPagos: number;
  montoTotalPagos: number;
  desembolsosPorDia: ArqueoDiaDesembolsos[];
  totalDesembolsos: number;
  montoTotalDesembolsos: number;
  totalFondosPropios: number;
  totalTransferenciaBancaria: number;
  totalIngresos: number;
  totalRetiros: number;
  totalEntregar: number;
}

@Injectable()
export class ReporteArqueoService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Prestamo)
    private readonly prestamoRepository: Repository<Prestamo>,
  ) {}

  async generarReporte(params: ArqueoParams): Promise<ArqueoResponse> {
    // 1. Pagos agrupados por día
    const pagosAgrupados = await this.pagoRepository
      .createQueryBuilder('pago')
      .select('pago.fechaPago', 'fecha')
      .addSelect('COUNT(*)', 'cantidad')
      .addSelect('SUM(pago.montoPagado)', 'monto')
      .where('pago.fechaPago BETWEEN :desde AND :hasta', {
        desde: params.fechaDesde,
        hasta: params.fechaHasta,
      })
      .andWhere('pago.estado = :estado', { estado: 'APLICADO' })
      .groupBy('pago.fechaPago')
      .orderBy('pago.fechaPago', 'ASC')
      .getRawMany();

    const pagosPorDia: ArqueoDiaPagos[] = pagosAgrupados.map((r) => ({
      fecha: r.fecha,
      cantidad: Number(r.cantidad),
      monto: Math.round(Number(r.monto) * 100) / 100,
    }));

    // 2. Desembolsos agrupados por día
    const desembolsosAgrupados = await this.prestamoRepository
      .createQueryBuilder('prestamo')
      .select('prestamo.fechaOtorgamiento', 'fecha')
      .addSelect('COUNT(*)', 'cantidad')
      .addSelect('SUM(prestamo.montoDesembolsado)', 'montoDesembolsado')
      .addSelect('SUM(prestamo.fondosPropios)', 'fondosPropios')
      .addSelect('SUM(prestamo.transferenciaBancaria)', 'transferenciaBancaria')
      .where('prestamo.fechaOtorgamiento BETWEEN :desde AND :hasta', {
        desde: params.fechaDesde,
        hasta: params.fechaHasta,
      })
      .groupBy('prestamo.fechaOtorgamiento')
      .orderBy('prestamo.fechaOtorgamiento', 'ASC')
      .getRawMany();

    const desembolsosPorDia: ArqueoDiaDesembolsos[] =
      desembolsosAgrupados.map((r) => ({
        fecha: r.fecha,
        cantidad: Number(r.cantidad),
        montoDesembolsado:
          Math.round(Number(r.montoDesembolsado) * 100) / 100,
        fondosPropios: Math.round(Number(r.fondosPropios) * 100) / 100,
        transferenciaBancaria:
          Math.round(Number(r.transferenciaBancaria) * 100) / 100,
      }));

    // 3. Totales
    const totalPagos = pagosPorDia.reduce((s, p) => s + p.cantidad, 0);
    const montoTotalPagos = pagosPorDia.reduce((s, p) => s + p.monto, 0);
    const totalDesembolsos = desembolsosPorDia.reduce(
      (s, d) => s + d.cantidad,
      0,
    );
    const montoTotalDesembolsos = desembolsosPorDia.reduce(
      (s, d) => s + d.montoDesembolsado,
      0,
    );
    const totalFondosPropios = desembolsosPorDia.reduce(
      (s, d) => s + d.fondosPropios,
      0,
    );
    const totalTransferenciaBancaria = desembolsosPorDia.reduce(
      (s, d) => s + d.transferenciaBancaria,
      0,
    );

    const totalIngresos = montoTotalPagos + totalTransferenciaBancaria;
    const totalRetiros = totalFondosPropios + totalTransferenciaBancaria;
    const totalEntregar = totalIngresos - totalRetiros;

    return {
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
      pagosPorDia,
      totalPagos,
      montoTotalPagos: Math.round(montoTotalPagos * 100) / 100,
      desembolsosPorDia,
      totalDesembolsos,
      montoTotalDesembolsos: Math.round(montoTotalDesembolsos * 100) / 100,
      totalFondosPropios: Math.round(totalFondosPropios * 100) / 100,
      totalTransferenciaBancaria:
        Math.round(totalTransferenciaBancaria * 100) / 100,
      totalIngresos: Math.round(totalIngresos * 100) / 100,
      totalRetiros: Math.round(totalRetiros * 100) / 100,
      totalEntregar: Math.round(totalEntregar * 100) / 100,
    };
  }

  async generarColectaDiaria(params: ArqueoParams): Promise<ColectaDiariaResponse> {
    const pagosRaw = await this.pagoRepository
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.prestamo', 'prestamo')
      .leftJoinAndSelect('prestamo.persona', 'persona')
      .where('pago.fechaPago BETWEEN :desde AND :hasta', {
        desde: params.fechaDesde,
        hasta: params.fechaHasta,
      })
      .andWhere('pago.estado = :estado', { estado: 'APLICADO' })
      .orderBy('pago.fechaPago', 'ASC')
      .addOrderBy('pago.numeroPago', 'ASC')
      .getMany();

    // Agrupar por día
    const diasMap = new Map<string, PagoColecta[]>();
    for (const p of pagosRaw) {
      const fecha = String(p.fechaPago).substring(0, 10);
      if (!diasMap.has(fecha)) {
        diasMap.set(fecha, []);
      }
      diasMap.get(fecha)!.push({
        numeroPago: p.numeroPago,
        nombreCliente: p.prestamo?.persona
          ? `${p.prestamo.persona.nombre} ${p.prestamo.persona.apellido}`
          : '',
        montoPagado: Number(p.montoPagado) || 0,
      });
    }

    const dias: ColectaDia[] = [];
    for (const [fecha, pagos] of diasMap) {
      const subtotalMonto = pagos.reduce((s, p) => s + p.montoPagado, 0);
      dias.push({
        fecha,
        pagos,
        subtotalPagos: pagos.length,
        subtotalMonto: Math.round(subtotalMonto * 100) / 100,
      });
    }

    const totalPagos = pagosRaw.length;
    const montoTotal = dias.reduce((s, d) => s + d.subtotalMonto, 0);

    return {
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
      dias,
      totalPagos,
      montoTotal: Math.round(montoTotal * 100) / 100,
    };
  }
}

export interface PagoColecta {
  numeroPago: string;
  nombreCliente: string;
  montoPagado: number;
}

export interface ColectaDia {
  fecha: string;
  pagos: PagoColecta[];
  subtotalPagos: number;
  subtotalMonto: number;
}

export interface ColectaDiariaResponse {
  fechaDesde: string;
  fechaHasta: string;
  dias: ColectaDia[];
  totalPagos: number;
  montoTotal: number;
}
