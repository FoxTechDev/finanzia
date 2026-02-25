import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between, MoreThanOrEqual } from 'typeorm';
import { Prestamo } from '../entities/prestamo.entity';
import { PlanPago, EstadoCuota } from '../entities/plan-pago.entity';
import { FiltrosPrestamoDto } from '../dto/filtros-prestamo.dto';
import {
  PrestamoDetalleDto,
  PlanPagoDetalleDto,
  PrestamoResumenDto,
  PrestamoPaginadoDto,
} from '../dto/prestamo-detalle.dto';
import { ReciboDesembolsoDto } from '../dto/recibo-desembolso.dto';
import { parseLocalDate } from '../../../common/utils/date.utils';

/**
 * Servicio especializado para consultas de préstamos
 * Proporciona métodos para listar, filtrar y obtener información detallada de préstamos
 */
@Injectable()
export class PrestamoConsultaService {
  constructor(
    @InjectRepository(Prestamo)
    private prestamoRepository: Repository<Prestamo>,
    @InjectRepository(PlanPago)
    private planPagoRepository: Repository<PlanPago>,
  ) {}

  /**
   * Lista todos los préstamos con filtros y paginación
   */
  async listarPrestamos(filtros: FiltrosPrestamoDto): Promise<PrestamoPaginadoDto> {
    const { page = 1, limit = 10, orderBy = 'fechaOtorgamiento', orderDirection = 'DESC' } = filtros;

    // Construir condiciones de filtrado
    const where = this.construirFiltros(filtros);

    // Construir query con relaciones
    const queryBuilder = this.prestamoRepository
      .createQueryBuilder('prestamo')
      .leftJoinAndSelect('prestamo.persona', 'persona')
      .leftJoinAndSelect('prestamo.tipoCredito', 'tipoCredito')
      .leftJoinAndSelect('tipoCredito.lineaCredito', 'lineaCredito')
      .leftJoinAndSelect('prestamo.clasificacionPrestamo', 'clasificacion')
      .leftJoinAndSelect('prestamo.estadoPrestamoRelacion', 'estadoRelacion');

    // Aplicar filtros
    if (filtros.estado) {
      queryBuilder.andWhere('prestamo.estado = :estado', { estado: filtros.estado });
    }

    if (filtros.clasificacion) {
      queryBuilder.andWhere('prestamo.categoriaNCB022 = :clasificacion', {
        clasificacion: filtros.clasificacion,
      });
    }

    if (filtros.clasificacionPrestamoId) {
      queryBuilder.andWhere('prestamo.clasificacionPrestamoId = :clasificacionId', {
        clasificacionId: filtros.clasificacionPrestamoId,
      });
    }

    if (filtros.estadoPrestamoId) {
      queryBuilder.andWhere('prestamo.estadoPrestamoId = :estadoId', {
        estadoId: filtros.estadoPrestamoId,
      });
    }

    if (filtros.personaId) {
      queryBuilder.andWhere('prestamo.personaId = :personaId', {
        personaId: filtros.personaId,
      });
    }

    if (filtros.tipoCreditoId) {
      queryBuilder.andWhere('prestamo.tipoCreditoId = :tipoCreditoId', {
        tipoCreditoId: filtros.tipoCreditoId,
      });
    }

    if (filtros.numeroCredito) {
      queryBuilder.andWhere('prestamo.numeroCredito LIKE :numeroCredito', {
        numeroCredito: `%${filtros.numeroCredito}%`,
      });
    }

    if (filtros.numeroDui) {
      queryBuilder.andWhere('persona.numeroDui = :numeroDui', {
        numeroDui: filtros.numeroDui,
      });
    }

    if (filtros.nombreCliente) {
      queryBuilder.andWhere(
        '(persona.nombre LIKE :nombre OR persona.apellido LIKE :nombre)',
        { nombre: `%${filtros.nombreCliente}%` },
      );
    }

    if (filtros.fechaDesde) {
      queryBuilder.andWhere('prestamo.fechaOtorgamiento >= :fechaDesde', {
        fechaDesde: filtros.fechaDesde,
      });
    }

    if (filtros.fechaHasta) {
      queryBuilder.andWhere('prestamo.fechaOtorgamiento <= :fechaHasta', {
        fechaHasta: filtros.fechaHasta,
      });
    }

    if (filtros.enMora === true) {
      queryBuilder.andWhere('prestamo.diasMora > 0');
    }

    if (filtros.diasMoraMinimo) {
      queryBuilder.andWhere('prestamo.diasMora >= :diasMoraMinimo', {
        diasMoraMinimo: filtros.diasMoraMinimo,
      });
    }

    // Contar total de registros
    const total = await queryBuilder.getCount();

    // Aplicar ordenamiento
    queryBuilder.orderBy(`prestamo.${orderBy}`, orderDirection);

    // Aplicar paginación
    queryBuilder.skip((page - 1) * limit).take(limit);

    // Ejecutar query
    const prestamos = await queryBuilder.getMany();

    // Transformar a DTO de resumen
    const data = await Promise.all(
      prestamos.map((prestamo) => this.transformarAResumen(prestamo)),
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene un préstamo con toda su información detallada
   */
  async obtenerPrestamoDetallado(id: number): Promise<PrestamoDetalleDto> {
    const prestamo = await this.prestamoRepository.findOne({
      where: { id },
      relations: [
        'persona',
        'solicitud',
        'tipoCredito',
        'planPago',
        'deducciones',
        'recargos',
        'clasificacionPrestamo',
        'estadoPrestamoRelacion',
      ],
    });

    if (!prestamo) {
      throw new NotFoundException(`Préstamo con ID ${id} no encontrado`);
    }

    return this.transformarADetalle(prestamo);
  }

  /**
   * Obtiene el plan de pagos detallado de un préstamo
   */
  async obtenerPlanPago(prestamoId: number): Promise<PlanPagoDetalleDto[]> {
    const prestamo = await this.prestamoRepository.findOne({
      where: { id: prestamoId },
    });

    if (!prestamo) {
      throw new NotFoundException(`Préstamo con ID ${prestamoId} no encontrado`);
    }

    const planPago = await this.planPagoRepository.find({
      where: { prestamoId },
      order: { numeroCuota: 'ASC' },
    });

    return planPago.map((cuota) => this.transformarCuotaADetalle(cuota));
  }

  /**
   * Obtiene los préstamos de un cliente específico
   */
  async obtenerPrestamosPorCliente(personaId: number): Promise<PrestamoResumenDto[]> {
    const prestamos = await this.prestamoRepository.find({
      where: { personaId },
      relations: ['persona', 'tipoCredito', 'clasificacionPrestamo', 'estadoPrestamoRelacion'],
      order: { fechaOtorgamiento: 'DESC' },
    });

    return Promise.all(prestamos.map((p) => this.transformarAResumen(p)));
  }

  /**
   * Obtiene los préstamos activos (VIGENTE o MORA) de un cliente específico
   * Usado para la funcionalidad de refinanciamiento
   */
  async obtenerPrestamosActivosPorCliente(personaId: number): Promise<PrestamoResumenDto[]> {
    const prestamos = await this.prestamoRepository
      .createQueryBuilder('prestamo')
      .leftJoinAndSelect('prestamo.persona', 'persona')
      .leftJoinAndSelect('prestamo.tipoCredito', 'tipoCredito')
      .leftJoinAndSelect('prestamo.clasificacionPrestamo', 'clasificacion')
      .leftJoinAndSelect('prestamo.estadoPrestamoRelacion', 'estadoRelacion')
      .where('prestamo.personaId = :personaId', { personaId })
      .andWhere('prestamo.estado IN (:...estados)', { estados: ['VIGENTE', 'MORA'] })
      .orderBy('prestamo.fechaOtorgamiento', 'DESC')
      .getMany();

    return Promise.all(prestamos.map((p) => this.transformarAResumenConSaldoTotal(p)));
  }

  /**
   * Transforma una entidad Prestamo a DTO de resumen con saldo total (para refinanciamiento)
   */
  private async transformarAResumenConSaldoTotal(prestamo: Prestamo): Promise<PrestamoResumenDto & { saldoTotal: number }> {
    const resumen = await this.transformarAResumen(prestamo);

    // Calcular saldo total: saldoCapital + saldoInteres + capitalMora + interesMora
    const saldoTotal =
      Number(prestamo.saldoCapital) +
      Number(prestamo.saldoInteres) +
      Number(prestamo.capitalMora) +
      Number(prestamo.interesMora);

    return {
      ...resumen,
      saldoTotal,
    };
  }

  /**
   * Obtiene los datos necesarios para generar el recibo de desembolso
   * @param id ID del préstamo
   * @returns Datos formateados para el recibo de impresora térmica
   */
  async obtenerReciboDesembolso(id: number): Promise<ReciboDesembolsoDto> {
    const prestamo = await this.prestamoRepository.findOne({
      where: { id },
      relations: ['persona', 'tipoCredito', 'deducciones'],
    });

    if (!prestamo) {
      throw new NotFoundException(`Préstamo con ID ${id} no encontrado`);
    }

    if (!prestamo.persona) {
      throw new NotFoundException(
        `No se encontró el cliente asociado al préstamo ${prestamo.numeroCredito}`,
      );
    }

    // Calcular total de deducciones
    const deducciones = (prestamo.deducciones || []).map((d) => ({
      nombre: d.nombre,
      montoCalculado: Number(d.montoCalculado),
    }));

    const totalDeducciones = deducciones.reduce(
      (sum, d) => sum + d.montoCalculado,
      0,
    );

    return {
      institucion: 'FINANZIA S.C. DE R.L. DE C.V.',
      fechaEmision: new Date().toISOString(),
      cliente: {
        nombre: prestamo.persona.nombre,
        apellido: prestamo.persona.apellido,
        numeroDui: prestamo.persona.numeroDui || '',
      },
      prestamo: {
        id: prestamo.id,
        numeroCredito: prestamo.numeroCredito,
        montoAutorizado: Number(prestamo.montoAutorizado),
        plazoAutorizado: prestamo.plazoAutorizado,
        tasaInteres: Number(prestamo.tasaInteres),
        tipoInteres: prestamo.tipoInteres,
        periodicidadPago: prestamo.periodicidadPago,
        numeroCuotas: prestamo.numeroCuotas,
        cuotaTotal: Number(prestamo.cuotaTotal),
        fechaOtorgamiento: prestamo.fechaOtorgamiento,
        fechaVencimiento: prestamo.fechaVencimiento,
      },
      deducciones,
      totalDeducciones,
      montoLiquido: Number(prestamo.montoDesembolsado),
    };
  }

  /**
   * Construye las condiciones de filtrado
   */
  private construirFiltros(filtros: FiltrosPrestamoDto): FindOptionsWhere<Prestamo> {
    const where: FindOptionsWhere<Prestamo> = {};

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.clasificacion) {
      where.categoriaNCB022 = filtros.clasificacion;
    }

    if (filtros.clasificacionPrestamoId) {
      where.clasificacionPrestamoId = filtros.clasificacionPrestamoId;
    }

    if (filtros.estadoPrestamoId) {
      where.estadoPrestamoId = filtros.estadoPrestamoId;
    }

    if (filtros.personaId) {
      where.personaId = filtros.personaId;
    }

    if (filtros.tipoCreditoId) {
      where.tipoCreditoId = filtros.tipoCreditoId;
    }

    if (filtros.numeroCredito) {
      where.numeroCredito = Like(`%${filtros.numeroCredito}%`);
    }

    if (filtros.fechaDesde && filtros.fechaHasta) {
      where.fechaOtorgamiento = Between(
        parseLocalDate(filtros.fechaDesde),
        parseLocalDate(filtros.fechaHasta),
      );
    } else if (filtros.fechaDesde) {
      where.fechaOtorgamiento = MoreThanOrEqual(parseLocalDate(filtros.fechaDesde));
    }

    if (filtros.diasMoraMinimo) {
      where.diasMora = MoreThanOrEqual(filtros.diasMoraMinimo);
    }

    return where;
  }

  /**
   * Transforma una entidad Prestamo a DTO de resumen
   */
  private async transformarAResumen(prestamo: Prestamo): Promise<PrestamoResumenDto> {
    // Obtener próxima cuota pendiente
    const proximaCuota = await this.planPagoRepository.findOne({
      where: {
        prestamoId: prestamo.id,
        estado: EstadoCuota.PENDIENTE,
      },
      order: { numeroCuota: 'ASC' },
    });

    return {
      id: prestamo.id,
      numeroCredito: prestamo.numeroCredito,
      estado: prestamo.estado,
      categoriaNCB022: prestamo.categoriaNCB022,
      cliente: {
        id: prestamo.personaId,
        nombreCompleto: prestamo.persona
          ? `${prestamo.persona.nombre} ${prestamo.persona.apellido}`
          : '',
        numeroDui: prestamo.persona?.numeroDui || '',
      },
      tipoCredito: {
        id: prestamo.tipoCreditoId,
        nombre: prestamo.tipoCredito?.nombre || '',
        lineaCredito: prestamo.tipoCredito?.lineaCredito
          ? {
              id: prestamo.tipoCredito.lineaCredito.id,
              nombre: prestamo.tipoCredito.lineaCredito.nombre,
            }
          : undefined,
      },
      montoAutorizado: Number(prestamo.montoAutorizado),
      montoDesembolsado: Number(prestamo.montoDesembolsado),
      saldoCapital: Number(prestamo.saldoCapital),
      diasMora: prestamo.diasMora,
      periodicidadPago: prestamo.periodicidadPago,
      tasaInteres: Number(prestamo.tasaInteres),
      numeroCuotas: prestamo.numeroCuotas,
      fechaOtorgamiento: prestamo.fechaOtorgamiento,
      fechaVencimiento: prestamo.fechaVencimiento,
      proximaCuota: proximaCuota
        ? {
            numeroCuota: proximaCuota.numeroCuota,
            fechaVencimiento: proximaCuota.fechaVencimiento,
            cuotaTotal: Number(proximaCuota.cuotaTotal),
          }
        : null,
    };
  }

  /**
   * Transforma una entidad Prestamo a DTO detallado
   */
  private async transformarADetalle(prestamo: Prestamo): Promise<PrestamoDetalleDto> {
    // Obtener estadísticas del plan de pagos
    const planPago = await this.planPagoRepository.find({
      where: { prestamoId: prestamo.id },
      order: { numeroCuota: 'ASC' },
    });

    const totalCuotas = planPago.length;
    const cuotasPendientes = planPago.filter((c) => c.estado === EstadoCuota.PENDIENTE).length;
    const cuotasPagadas = planPago.filter((c) => c.estado === EstadoCuota.PAGADA).length;
    const cuotasEnMora = planPago.filter((c) => c.estado === EstadoCuota.MORA).length;

    const proximaCuota = planPago.find((c) => c.estado === EstadoCuota.PENDIENTE);

    return {
      id: prestamo.id,
      numeroCredito: prestamo.numeroCredito,
      estado: prestamo.estado,
      categoriaNCB022: prestamo.categoriaNCB022,
      cliente: {
        id: prestamo.personaId,
        nombre: prestamo.persona?.nombre || '',
        apellido: prestamo.persona?.apellido || '',
        nombreCompleto: prestamo.persona
          ? `${prestamo.persona.nombre} ${prestamo.persona.apellido}`
          : '',
        numeroDui: prestamo.persona?.numeroDui || '',
        telefono: prestamo.persona?.telefono || '',
        correoElectronico: prestamo.persona?.correoElectronico || '',
      },
      tipoCredito: {
        id: prestamo.tipoCreditoId,
        nombre: prestamo.tipoCredito?.nombre || '',
        codigo: prestamo.tipoCredito?.codigo || '',
      },
      solicitud: {
        id: prestamo.solicitudId,
        numeroSolicitud: prestamo.solicitud?.numeroSolicitud || '',
        fechaSolicitud: prestamo.solicitud?.fechaSolicitud || new Date(),
      },
      montoAutorizado: Number(prestamo.montoAutorizado),
      montoDesembolsado: Number(prestamo.montoDesembolsado),
      totalPagar: Number(prestamo.totalPagar),
      totalInteres: Number(prestamo.totalInteres),
      totalRecargos: Number(prestamo.totalRecargos),
      saldoCapital: Number(prestamo.saldoCapital),
      saldoInteres: Number(prestamo.saldoInteres),
      capitalMora: Number(prestamo.capitalMora),
      interesMora: Number(prestamo.interesMora),
      diasMora: prestamo.diasMora,
      plazoAutorizado: prestamo.plazoAutorizado,
      numeroCuotas: prestamo.numeroCuotas,
      cuotaNormal: Number(prestamo.cuotaNormal),
      cuotaTotal: Number(prestamo.cuotaTotal),
      tasaInteres: Number(prestamo.tasaInteres),
      tasaInteresMoratorio: Number(prestamo.tasaInteresMoratorio),
      tipoInteres: prestamo.tipoInteres,
      periodicidadPago: prestamo.periodicidadPago,
      fechaOtorgamiento: prestamo.fechaOtorgamiento,
      fechaPrimeraCuota: prestamo.fechaPrimeraCuota,
      fechaVencimiento: prestamo.fechaVencimiento,
      fechaUltimoPago: prestamo.fechaUltimoPago,
      fechaCancelacion: prestamo.fechaCancelacion,
      deducciones: (prestamo.deducciones || []).map((d) => ({
        id: d.id,
        nombre: d.nombre,
        tipoCalculo: d.tipoCalculo,
        valor: Number(d.valor),
        montoCalculado: Number(d.montoCalculado),
      })),
      recargos: (prestamo.recargos || []).map((r) => ({
        id: r.id,
        nombre: r.nombre,
        tipoCalculo: r.tipoCalculo,
        valor: Number(r.valor),
        montoCalculado: Number(r.montoCalculado),
        aplicaDesde: r.aplicaDesde,
        aplicaHasta: r.aplicaHasta,
      })),
      resumenPlanPago: {
        totalCuotas,
        cuotasPendientes,
        cuotasPagadas,
        cuotasEnMora,
        proximaCuota: proximaCuota
          ? {
              numeroCuota: proximaCuota.numeroCuota,
              fechaVencimiento: proximaCuota.fechaVencimiento,
              cuotaTotal: Number(proximaCuota.cuotaTotal),
              saldoPendiente:
                Number(proximaCuota.cuotaTotal) -
                Number(proximaCuota.capitalPagado) -
                Number(proximaCuota.interesPagado) -
                Number(proximaCuota.recargosPagado),
            }
          : null,
      },
      usuarioDesembolsoId: prestamo.usuarioDesembolsoId,
      nombreUsuarioDesembolso: prestamo.nombreUsuarioDesembolso,
      createdAt: prestamo.createdAt,
      updatedAt: prestamo.updatedAt,
    };
  }

  /**
   * Transforma una cuota del plan de pagos a DTO detallado
   */
  private transformarCuotaADetalle(cuota: PlanPago): PlanPagoDetalleDto {
    const saldoPendiente =
      Number(cuota.cuotaTotal) -
      Number(cuota.capitalPagado) -
      Number(cuota.interesPagado) -
      Number(cuota.recargosPagado);

    return {
      id: cuota.id,
      numeroCuota: cuota.numeroCuota,
      fechaVencimiento: cuota.fechaVencimiento,
      capital: Number(cuota.capital),
      interes: Number(cuota.interes),
      recargos: Number(cuota.recargos),
      cuotaTotal: Number(cuota.cuotaTotal),
      saldoCapital: Number(cuota.saldoCapital),
      capitalPagado: Number(cuota.capitalPagado),
      interesPagado: Number(cuota.interesPagado),
      recargosPagado: Number(cuota.recargosPagado),
      diasMora: cuota.diasMora,
      interesMoratorio: Number(cuota.interesMoratorio),
      interesMoratorioPagado: Number(cuota.interesMoratorioPagado),
      estado: cuota.estado,
      fechaPago: cuota.fechaPago,
      saldoPendiente,
      createdAt: cuota.createdAt,
      updatedAt: cuota.updatedAt,
    };
  }
}
