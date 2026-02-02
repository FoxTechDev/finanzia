import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Prestamo, EstadoPrestamo, CategoriaNCB022 } from '../entities/prestamo.entity';
import { PlanPago, EstadoCuota } from '../entities/plan-pago.entity';
import { DeduccionPrestamo } from '../entities/deduccion-prestamo.entity';
import { RecargoPrestamo } from '../entities/recargo-prestamo.entity';
import { TipoDeduccion, TipoCalculo } from '../entities/tipo-deduccion.entity';
import { TipoRecargo } from '../entities/tipo-recargo.entity';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';
import { SolicitudHistorial } from '../../solicitud/entities/solicitud-historial.entity';
import { Pago, TipoPago, EstadoPago } from '../../pagos/entities/pago.entity';
import { EstadoSolicitudService } from '../../../catalogos/estado-solicitud/estado-solicitud.service';
import {
  PreviewDesembolsoDto,
  DeduccionDto,
} from '../dto/preview-desembolso.dto';
import { CrearDesembolsoDto } from '../dto/crear-desembolso.dto';
import {
  CalculoInteresService,
  ResultadoCalculo,
} from './calculo-interes.service';
import {
  PlanPagoService,
  RecargoCalculado,
  CuotaPlanPago,
} from './plan-pago.service';

export interface DeduccionCalculada {
  nombre: string;
  tipoDeduccionId?: number;
  tipoCalculo: TipoCalculo;
  valor: number;
  monto: number;
  prestamoACancelarId?: number;
  cancelacionPrestamo?: boolean;
}

export interface PreviewResponse {
  // Información de la solicitud
  solicitudId: number;
  numeroSolicitud: string;
  personaId: number;
  nombreCliente: string;
  tipoCreditoId: number;
  nombreTipoCredito: string;

  // Montos
  montoAutorizado: number;
  deducciones: DeduccionCalculada[];
  totalDeducciones: number;
  montoDesembolsado: number;

  // Recargos
  recargos: {
    nombre: string;
    montoPorCuota: number;
  }[];
  totalRecargosPorCuota: number;

  // Cuotas
  cuotaNormal: number;
  cuotaTotal: number;
  numeroCuotas: number;

  // Totales
  totalInteres: number;
  totalRecargos: number;
  totalAPagar: number;

  // Plan de pago
  planPago: CuotaPlanPago[];

  // Fechas
  fechaOtorgamiento: Date;
  fechaPrimeraCuota: Date;
  fechaVencimiento: Date;
}

@Injectable()
export class DesembolsoService {
  constructor(
    @InjectRepository(Prestamo)
    private prestamoRepository: Repository<Prestamo>,
    @InjectRepository(PlanPago)
    private planPagoRepository: Repository<PlanPago>,
    @InjectRepository(DeduccionPrestamo)
    private deduccionRepository: Repository<DeduccionPrestamo>,
    @InjectRepository(RecargoPrestamo)
    private recargoRepository: Repository<RecargoPrestamo>,
    @InjectRepository(TipoDeduccion)
    private tipoDeduccionRepository: Repository<TipoDeduccion>,
    @InjectRepository(TipoRecargo)
    private tipoRecargoRepository: Repository<TipoRecargo>,
    @InjectRepository(Solicitud)
    private solicitudRepository: Repository<Solicitud>,
    @InjectRepository(SolicitudHistorial)
    private historialRepository: Repository<SolicitudHistorial>,
    private estadoSolicitudService: EstadoSolicitudService,
    private dataSource: DataSource,
    private calculoInteresService: CalculoInteresService,
    private planPagoService: PlanPagoService,
  ) {}

  /**
   * Obtiene las solicitudes aprobadas pendientes de desembolso
   */
  async getPendientes(): Promise<Solicitud[]> {
    return this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.persona', 'persona')
      .leftJoinAndSelect('solicitud.tipoCredito', 'tipoCredito')
      .leftJoinAndSelect('solicitud.lineaCredito', 'lineaCredito')
      .leftJoinAndSelect('solicitud.estado', 'estado')
      .leftJoinAndSelect('solicitud.periodicidadPago', 'periodicidadPago')
      .where('estado.codigo = :estadoCodigo', { estadoCodigo: 'APROBADA' })
      .orderBy('solicitud.fechaDecisionComite', 'ASC')
      .getMany();
  }

  /**
   * Genera un preview del desembolso sin guardar
   */
  async preview(dto: PreviewDesembolsoDto): Promise<PreviewResponse> {
    // Obtener la solicitud
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: dto.solicitudId },
      relations: ['persona', 'tipoCredito', 'estado'],
    });

    if (!solicitud) {
      throw new NotFoundException(
        `Solicitud con ID ${dto.solicitudId} no encontrada`,
      );
    }

    if (solicitud.estado.codigo !== 'APROBADA') {
      throw new BadRequestException(
        `La solicitud debe estar en estado APROBADA para desembolsar. Estado actual: ${solicitud.estado.nombre}`,
      );
    }

    // Usar montos aprobados por el comité o los solicitados si no hay aprobados
    // IMPORTANTE: TypeORM devuelve campos decimal como strings, hay que convertirlos
    const montoAutorizado = this.toNumber(
      solicitud.montoAprobado || solicitud.montoSolicitado,
      'monto autorizado',
    );
    const plazoAutorizado = this.toNumber(
      solicitud.plazoAprobado || solicitud.plazoSolicitado,
      'plazo autorizado',
    );
    const tasaInteres = this.toNumber(
      solicitud.tasaInteresAprobada ?? solicitud.tasaInteresPropuesta,
      'tasa de interés',
    );

    if (montoAutorizado <= 0) {
      throw new BadRequestException(
        `Monto autorizado debe ser mayor a 0: ${montoAutorizado}. ` +
        `montoAprobado: ${solicitud.montoAprobado}, montoSolicitado: ${solicitud.montoSolicitado}`,
      );
    }

    if (plazoAutorizado <= 0) {
      throw new BadRequestException(
        `Plazo autorizado debe ser mayor a 0: ${plazoAutorizado}. ` +
        `plazoAprobado: ${solicitud.plazoAprobado}, plazoSolicitado: ${solicitud.plazoSolicitado}`,
      );
    }

    if (tasaInteres < 0) {
      throw new BadRequestException(
        `Tasa de interés no puede ser negativa: ${tasaInteres}. ` +
        `tasaInteresAprobada: ${solicitud.tasaInteresAprobada}, tasaInteresPropuesta: ${solicitud.tasaInteresPropuesta}`,
      );
    }

    // Calcular deducciones
    const deduccionesCalculadas = await this.calcularDeducciones(
      dto.deducciones,
      montoAutorizado,
    );
    const totalDeducciones = deduccionesCalculadas.reduce(
      (sum, d) => sum + d.monto,
      0,
    );
    const montoDesembolsado = this.redondear(montoAutorizado - totalDeducciones);

    // Calcular interés y cuotas
    // Si se especifica numeroCuotas en el DTO, usar ese valor; sino, calcular automáticamente
    const resultadoCalculo = dto.numeroCuotas
      ? this.calculoInteresService.calcularConCuotasPersonalizadas(
          montoAutorizado,
          tasaInteres,
          plazoAutorizado,
          dto.numeroCuotas,
          dto.tipoInteres,
          dto.periodicidadPago,
        )
      : this.calculoInteresService.calcular(
          montoAutorizado,
          tasaInteres,
          plazoAutorizado,
          dto.tipoInteres,
          dto.periodicidadPago,
        );

    // Calcular recargos
    const recargosCalculados = await this.calcularRecargos(
      dto.recargos,
      resultadoCalculo.cuotaNormal,
      resultadoCalculo.numeroCuotas,
    );
    const totalRecargosPorCuota = recargosCalculados.reduce(
      (sum, r) => sum + r.montoCalculado,
      0,
    );

    // Calcular cuota total (normal + recargos)
    const cuotaTotal = this.redondear(
      resultadoCalculo.cuotaNormal + totalRecargosPorCuota,
    );

    // Calcular total de recargos para todo el préstamo
    const totalRecargos = this.planPagoService.calcularTotalRecargos(
      recargosCalculados,
      resultadoCalculo.numeroCuotas,
    );

    // Total a pagar
    const totalAPagar = this.redondear(
      resultadoCalculo.totalPagar + totalRecargos,
    );

    // Generar plan de pago
    const fechaPrimeraCuota = new Date(dto.fechaPrimeraCuota);
    const planPago = this.planPagoService.generarPlanPago(
      fechaPrimeraCuota,
      dto.periodicidadPago,
      resultadoCalculo.cuotas,
      recargosCalculados,
      resultadoCalculo.cuotaNormal,
    );

    // Fecha de vencimiento (última cuota)
    const fechaVencimiento = this.planPagoService.calcularFechaVencimientoPrestamo(
      fechaPrimeraCuota,
      dto.periodicidadPago,
      resultadoCalculo.numeroCuotas,
    );

    return {
      solicitudId: solicitud.id,
      numeroSolicitud: solicitud.numeroSolicitud,
      personaId: solicitud.personaId,
      nombreCliente: solicitud.persona
        ? `${solicitud.persona.nombre} ${solicitud.persona.apellido}`
        : '',
      tipoCreditoId: solicitud.tipoCreditoId,
      nombreTipoCredito: solicitud.tipoCredito?.nombre || '',

      montoAutorizado,
      deducciones: deduccionesCalculadas,
      totalDeducciones: this.redondear(totalDeducciones),
      montoDesembolsado,

      recargos: recargosCalculados.map((r) => ({
        nombre: r.nombre,
        montoPorCuota: r.montoCalculado,
      })),
      totalRecargosPorCuota: this.redondear(totalRecargosPorCuota),

      cuotaNormal: resultadoCalculo.cuotaNormal,
      cuotaTotal,
      numeroCuotas: resultadoCalculo.numeroCuotas,

      totalInteres: resultadoCalculo.totalInteres,
      totalRecargos,
      totalAPagar,

      planPago,

      fechaOtorgamiento: new Date(),
      fechaPrimeraCuota,
      fechaVencimiento,
    };
  }

  /**
   * Crea el desembolso y el préstamo
   */
  async crear(dto: CrearDesembolsoDto): Promise<Prestamo> {
    // Primero obtenemos el preview para calcular todos los valores
    const preview = await this.preview(dto);

    // Validar que todos los valores numéricos sean válidos
    this.validarValoresNumericos(preview);

    // Verificar que no exista un préstamo para esta solicitud
    const prestamoExistente = await this.prestamoRepository.findOne({
      where: { solicitudId: dto.solicitudId },
    });

    if (prestamoExistente) {
      throw new BadRequestException(
        `Ya existe un préstamo para la solicitud ${dto.solicitudId}`,
      );
    }

    // Obtener la solicitud para actualizar
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: dto.solicitudId },
      relations: ['tipoCredito', 'estado'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud ${dto.solicitudId} no encontrada`);
    }

    // Usar transacción para garantizar integridad
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generar número de crédito
      const numeroCredito = await this.generarNumeroCredito();

      // Crear el préstamo - asegurar que todos los valores sean números válidos
      // IMPORTANTE: preview ya tiene valores convertidos, pero los de solicitud pueden ser strings
      const plazoAutorizado = this.toNumberSafe(solicitud.plazoAprobado) || this.toNumberSafe(solicitud.plazoSolicitado);
      const tasaInteresVal = this.toNumberSafe(solicitud.tasaInteresAprobada) || this.toNumberSafe(solicitud.tasaInteresPropuesta);
      const tasaInteresMoratorioVal = this.toNumberSafe(solicitud.tipoCredito?.tasaInteresMoratorio);

      const prestamo = this.prestamoRepository.create({
        solicitudId: dto.solicitudId,
        personaId: preview.personaId,
        numeroCredito,
        tipoCreditoId: preview.tipoCreditoId,
        montoAutorizado: this.asegurarNumeroValido(preview.montoAutorizado),
        montoDesembolsado: this.asegurarNumeroValido(preview.montoDesembolsado),
        plazoAutorizado,
        tasaInteres: tasaInteresVal,
        tasaInteresMoratorio: tasaInteresMoratorioVal,
        tipoInteres: dto.tipoInteres,
        periodicidadPago: dto.periodicidadPago,
        cuotaNormal: this.asegurarNumeroValido(preview.cuotaNormal),
        cuotaTotal: this.asegurarNumeroValido(preview.cuotaTotal),
        numeroCuotas: preview.numeroCuotas,
        totalInteres: this.asegurarNumeroValido(preview.totalInteres),
        totalRecargos: this.asegurarNumeroValido(preview.totalRecargos),
        totalPagar: this.asegurarNumeroValido(preview.totalAPagar),
        saldoCapital: this.asegurarNumeroValido(preview.montoAutorizado),
        saldoInteres: 0,
        capitalMora: 0,
        interesMora: 0,
        diasMora: 0,
        fechaOtorgamiento: preview.fechaOtorgamiento,
        fechaPrimeraCuota: preview.fechaPrimeraCuota,
        fechaVencimiento: preview.fechaVencimiento,
        categoriaNCB022: CategoriaNCB022.A,
        estado: EstadoPrestamo.VIGENTE,
        usuarioDesembolsoId: dto.usuarioDesembolsoId,
        nombreUsuarioDesembolso: dto.nombreUsuarioDesembolso,
      });

      await queryRunner.manager.save(prestamo);

      // Crear el plan de pago
      for (const cuota of preview.planPago) {
        const planPagoEntity = this.planPagoRepository.create({
          prestamoId: prestamo.id,
          numeroCuota: cuota.numeroCuota,
          fechaVencimiento: cuota.fechaVencimiento,
          capital: cuota.capital,
          interes: cuota.interes,
          recargos: cuota.recargos,
          cuotaTotal: cuota.cuotaTotal,
          saldoCapital: cuota.saldoCapital,
          capitalPagado: 0,
          interesPagado: 0,
          recargosPagado: 0,
          diasMora: 0,
          interesMoratorio: 0,
          estado: EstadoCuota.PENDIENTE,
        });
        await queryRunner.manager.save(planPagoEntity);
      }

      // Crear las deducciones y procesar refinanciamientos
      const prestamosACancelar: number[] = [];

      for (const deduccion of preview.deducciones) {
        const deduccionEntity = this.deduccionRepository.create({
          prestamoId: prestamo.id,
          tipoDeduccionId: deduccion.tipoDeduccionId,
          nombre: deduccion.nombre,
          tipoCalculo: deduccion.tipoCalculo,
          valor: deduccion.valor,
          montoCalculado: deduccion.monto,
          prestamoACancelarId: deduccion.prestamoACancelarId,
        });
        await queryRunner.manager.save(deduccionEntity);

        // Si es una deducción de cancelación de préstamo, agregar a la lista
        if (deduccion.cancelacionPrestamo && deduccion.prestamoACancelarId) {
          prestamosACancelar.push(deduccion.prestamoACancelarId);
        }
      }

      // Procesar cancelaciones de préstamos (refinanciamiento)
      if (prestamosACancelar.length > 0) {
        // Marcar el nuevo préstamo como refinanciamiento
        await queryRunner.manager.update(Prestamo, prestamo.id, {
          refinanciamiento: true,
        });

        // Cancelar cada préstamo
        for (const prestamoACancelarId of prestamosACancelar) {
          await this.cancelarPrestamoRefinanciamiento(
            queryRunner,
            prestamoACancelarId,
            prestamo.id,
            dto.usuarioDesembolsoId,
            dto.nombreUsuarioDesembolso,
          );
        }
      }

      // Crear los recargos
      const recargosCalculados = await this.calcularRecargos(
        dto.recargos,
        preview.cuotaNormal,
        preview.numeroCuotas,
      );

      for (const recargo of recargosCalculados) {
        const recargoEntity = this.recargoRepository.create({
          prestamoId: prestamo.id,
          tipoRecargoId: recargo.tipoRecargoId,
          nombre: recargo.nombre,
          tipoCalculo: recargo.tipoCalculo,
          valor: recargo.valor,
          montoCalculado: recargo.montoCalculado,
          aplicaDesde: recargo.aplicaDesde,
          aplicaHasta: recargo.aplicaHasta || preview.numeroCuotas,
        });
        await queryRunner.manager.save(recargoEntity);
      }

      // Actualizar estado de la solicitud a DESEMBOLSADA
      const estadoDesembolsada = await this.estadoSolicitudService.findByCodigo('DESEMBOLSADA');
      const estadoAnteriorCodigo = solicitud.estado.codigo;

      // Usar update en lugar de save para evitar problemas con relaciones
      await queryRunner.manager.update(Solicitud, solicitud.id, {
        estadoId: estadoDesembolsada.id,
      });

      // Crear historial de la solicitud
      const historial = this.historialRepository.create({
        solicitudId: solicitud.id,
        estadoAnterior: estadoAnteriorCodigo,
        estadoNuevo: 'DESEMBOLSADA',
        observacion: `Desembolso realizado. Crédito Nº ${numeroCredito}. Monto desembolsado: $${preview.montoDesembolsado}`,
        usuarioId: dto.usuarioDesembolsoId,
        nombreUsuario: dto.nombreUsuarioDesembolso,
      });
      await queryRunner.manager.save(SolicitudHistorial, historial);

      await queryRunner.commitTransaction();

      // Retornar el préstamo con relaciones
      const prestamoCreado = await this.prestamoRepository.findOne({
        where: { id: prestamo.id },
        relations: ['persona', 'tipoCredito', 'planPago', 'deducciones', 'recargos'],
      });

      if (!prestamoCreado) {
        throw new NotFoundException(`Error al recuperar el préstamo creado`);
      }

      return prestamoCreado;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene un préstamo por ID
   */
  async findOne(id: number): Promise<Prestamo> {
    const prestamo = await this.prestamoRepository.findOne({
      where: { id },
      relations: [
        'persona',
        'solicitud',
        'tipoCredito',
        'planPago',
        'deducciones',
        'recargos',
      ],
    });

    if (!prestamo) {
      throw new NotFoundException(`Préstamo con ID ${id} no encontrado`);
    }

    return prestamo;
  }

  /**
   * Obtiene el plan de pago de un préstamo
   */
  async getPlanPago(prestamoId: number): Promise<PlanPago[]> {
    return this.planPagoRepository.find({
      where: { prestamoId },
      order: { numeroCuota: 'ASC' },
    });
  }

  /**
   * Lista todos los préstamos
   */
  async findAll(estado?: EstadoPrestamo): Promise<Prestamo[]> {
    const where = estado ? { estado } : {};
    return this.prestamoRepository.find({
      where,
      relations: ['persona', 'tipoCredito'],
      order: { fechaOtorgamiento: 'DESC' },
    });
  }

  /**
   * Calcula las deducciones
   */
  private async calcularDeducciones(
    deducciones: DeduccionDto[],
    montoBase: number,
  ): Promise<DeduccionCalculada[]> {
    const resultado: DeduccionCalculada[] = [];

    for (const deduccion of deducciones) {
      let nombre = deduccion.nombre || 'Deducción';
      let cancelacionPrestamo = false;
      let monto: number;

      // Si tiene tipoDeduccionId, obtener el nombre del catálogo
      if (deduccion.tipoDeduccionId) {
        const tipo = await this.tipoDeduccionRepository.findOne({
          where: { id: deduccion.tipoDeduccionId },
        });
        if (tipo) {
          nombre = tipo.nombre;
          cancelacionPrestamo = tipo.cancelacionPrestamo;
        }
      }

      // Si es una deducción de cancelación de préstamo, obtener el saldo total
      if (cancelacionPrestamo && deduccion.prestamoACancelarId) {
        const prestamoACancelar = await this.prestamoRepository.findOne({
          where: { id: deduccion.prestamoACancelarId },
        });

        if (!prestamoACancelar) {
          throw new BadRequestException(
            `Préstamo a cancelar con ID ${deduccion.prestamoACancelarId} no encontrado`,
          );
        }

        // Validar que el préstamo esté activo
        if (!['VIGENTE', 'MORA'].includes(prestamoACancelar.estado)) {
          throw new BadRequestException(
            `El préstamo ${prestamoACancelar.numeroCredito} no está activo (estado: ${prestamoACancelar.estado})`,
          );
        }

        // Calcular saldo total: saldoCapital + saldoInteres + capitalMora + interesMora
        monto = this.redondear(
          Number(prestamoACancelar.saldoCapital) +
          Number(prestamoACancelar.saldoInteres) +
          Number(prestamoACancelar.capitalMora) +
          Number(prestamoACancelar.interesMora),
        );
      } else {
        // Calcular monto según tipo de cálculo (comportamiento original)
        if (deduccion.tipoCalculo === TipoCalculo.PORCENTAJE) {
          monto = this.redondear(montoBase * (deduccion.valor / 100));
        } else {
          monto = this.redondear(deduccion.valor);
        }
      }

      resultado.push({
        nombre,
        tipoDeduccionId: deduccion.tipoDeduccionId,
        tipoCalculo: deduccion.tipoCalculo,
        valor: deduccion.valor,
        monto,
        prestamoACancelarId: deduccion.prestamoACancelarId,
        cancelacionPrestamo,
      });
    }

    return resultado;
  }

  /**
   * Calcula los recargos
   */
  private async calcularRecargos(
    recargos: any[],
    cuotaNormal: number,
    numeroCuotas: number,
  ): Promise<RecargoCalculado[]> {
    const resultado: RecargoCalculado[] = [];

    for (const recargo of recargos) {
      let nombre = recargo.nombre || 'Recargo';

      // Si tiene tipoRecargoId, obtener el nombre del catálogo
      if (recargo.tipoRecargoId) {
        const tipo = await this.tipoRecargoRepository.findOne({
          where: { id: recargo.tipoRecargoId },
        });
        if (tipo) {
          nombre = tipo.nombre;
        }
      }

      const calculado = this.planPagoService.calcularMontoRecargo(
        recargo,
        cuotaNormal,
        nombre,
      );

      // Actualizar aplicaHasta si es 0
      if (calculado.aplicaHasta === 0) {
        calculado.aplicaHasta = numeroCuotas;
      }

      resultado.push(calculado);
    }

    return resultado;
  }

  /**
   * Cancela un préstamo como parte del refinanciamiento
   * - Crea un pago tipo CANCELACION_TOTAL por el saldo total
   * - Actualiza el préstamo antiguo a estado CANCELADO
   * - Pone en cero todos los saldos
   * - Marca todas las cuotas pendientes como PAGADA
   */
  private async cancelarPrestamoRefinanciamiento(
    queryRunner: any,
    prestamoACancelarId: number,
    prestamoNuevoId: number,
    usuarioId: number | undefined,
    nombreUsuario: string | undefined,
  ): Promise<void> {
    // Obtener el préstamo a cancelar
    const prestamoACancelar = await queryRunner.manager.findOne(Prestamo, {
      where: { id: prestamoACancelarId },
    });

    if (!prestamoACancelar) {
      throw new BadRequestException(
        `Préstamo a cancelar con ID ${prestamoACancelarId} no encontrado`,
      );
    }

    // Calcular saldo total
    const saldoTotal = this.redondear(
      Number(prestamoACancelar.saldoCapital) +
      Number(prestamoACancelar.saldoInteres) +
      Number(prestamoACancelar.capitalMora) +
      Number(prestamoACancelar.interesMora),
    );

    // Generar número de pago
    const numeroPago = await this.generarNumeroPago(queryRunner);

    // Crear el pago de cancelación total
    const pago = queryRunner.manager.create(Pago, {
      prestamoId: prestamoACancelarId,
      numeroPago,
      fechaPago: new Date(),
      fechaRegistro: new Date(),
      montoPagado: saldoTotal,
      capitalAplicado: Number(prestamoACancelar.saldoCapital),
      interesAplicado: Number(prestamoACancelar.saldoInteres),
      recargosAplicado: 0,
      interesMoratorioAplicado: Number(prestamoACancelar.capitalMora) + Number(prestamoACancelar.interesMora),
      recargoManualAplicado: 0,
      saldoCapitalAnterior: Number(prestamoACancelar.saldoCapital),
      saldoInteresAnterior: Number(prestamoACancelar.saldoInteres),
      capitalMoraAnterior: Number(prestamoACancelar.capitalMora),
      interesMoraAnterior: Number(prestamoACancelar.interesMora),
      diasMoraAnterior: prestamoACancelar.diasMora,
      saldoCapitalPosterior: 0,
      saldoInteresPosterior: 0,
      tipoPago: TipoPago.CANCELACION_TOTAL,
      estado: EstadoPago.APLICADO,
      usuarioId,
      nombreUsuario,
      observaciones: `Cancelación por refinanciamiento. Nuevo préstamo ID: ${prestamoNuevoId}`,
    });

    await queryRunner.manager.save(Pago, pago);

    // Actualizar el préstamo a CANCELADO y poner saldos en cero
    await queryRunner.manager.update(Prestamo, prestamoACancelarId, {
      estado: EstadoPrestamo.CANCELADO,
      saldoCapital: 0,
      saldoInteres: 0,
      capitalMora: 0,
      interesMora: 0,
      diasMora: 0,
      fechaCancelacion: new Date(),
    });

    // Marcar todas las cuotas pendientes como PAGADA
    await queryRunner.manager.update(
      PlanPago,
      {
        prestamoId: prestamoACancelarId,
        estado: In([EstadoCuota.PENDIENTE, EstadoCuota.PARCIAL, EstadoCuota.MORA]),
      },
      {
        estado: EstadoCuota.PAGADA,
        fechaPago: new Date(),
      },
    );
  }

  /**
   * Genera un número de pago único
   */
  private async generarNumeroPago(queryRunner: any): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PAG${year}`;

    // Buscar el último número de pago del año
    const ultimoPago = await queryRunner.manager
      .createQueryBuilder(Pago, 'pago')
      .where('pago.numeroPago LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('pago.id', 'DESC')
      .getOne();

    let secuencia = 1;
    if (ultimoPago) {
      const ultimoNumero = ultimoPago.numeroPago.replace(prefix, '');
      secuencia = parseInt(ultimoNumero, 10) + 1;
    }

    return `${prefix}${secuencia.toString().padStart(6, '0')}`;
  }

  /**
   * Genera un número de crédito único
   */
  private async generarNumeroCredito(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CR${year}`;

    // Buscar el último número de crédito del año
    const ultimoPrestamo = await this.prestamoRepository
      .createQueryBuilder('prestamo')
      .where('prestamo.numeroCredito LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('prestamo.id', 'DESC')
      .getOne();

    let secuencia = 1;
    if (ultimoPrestamo) {
      const ultimoNumero = ultimoPrestamo.numeroCredito.replace(prefix, '');
      secuencia = parseInt(ultimoNumero, 10) + 1;
    }

    return `${prefix}${secuencia.toString().padStart(6, '0')}`;
  }

  /**
   * Convierte un valor a número, manejando strings de decimales
   * TypeORM devuelve campos decimal como strings
   */
  private toNumber(value: any, fieldName: string): number {
    if (value == null) {
      throw new BadRequestException(`${fieldName} es nulo o indefinido`);
    }

    const num = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(num)) {
      throw new BadRequestException(
        `${fieldName} no es un número válido: ${value} (tipo: ${typeof value})`,
      );
    }

    return num;
  }

  /**
   * Convierte un valor a número de forma segura, retornando 0 si es inválido
   */
  private toNumberSafe(value: any): number {
    if (value == null) return 0;
    const num = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  /**
   * Redondea a 2 decimales
   * Protege contra NaN e Infinity
   */
  private redondear(valor: number): number {
    // Si el valor no es un número finito, retornar 0
    if (!Number.isFinite(valor)) {
      return 0;
    }
    return Math.round(valor * 100) / 100;
  }

  /**
   * Asegura que un valor sea un número válido
   * Si es NaN, Infinity o null/undefined, retorna 0
   */
  private asegurarNumeroValido(valor: any): number {
    // Verificar si es null o undefined
    if (valor == null) {
      return 0;
    }

    // Convertir a número si no lo es
    const numero = typeof valor === 'number' ? valor : Number(valor);

    // Verificar si es NaN o Infinity
    if (!Number.isFinite(numero)) {
      return 0;
    }

    return numero;
  }

  /**
   * Valida que todos los valores numéricos críticos sean válidos
   * Lanza una excepción si encuentra valores inválidos
   */
  private validarValoresNumericos(preview: PreviewResponse): void {
    const errores: string[] = [];

    // Validar campos críticos
    if (!Number.isFinite(preview.montoAutorizado) || preview.montoAutorizado <= 0) {
      errores.push('Monto autorizado inválido');
    }

    if (!Number.isFinite(preview.montoDesembolsado) || preview.montoDesembolsado < 0) {
      errores.push('Monto desembolsado inválido');
    }

    if (!Number.isFinite(preview.cuotaNormal) || preview.cuotaNormal <= 0) {
      errores.push('Cuota normal inválida (NaN o <= 0)');
    }

    if (!Number.isFinite(preview.cuotaTotal) || preview.cuotaTotal <= 0) {
      errores.push('Cuota total inválida (NaN o <= 0)');
    }

    if (!Number.isFinite(preview.totalInteres) || preview.totalInteres < 0) {
      errores.push('Total de interés inválido');
    }

    if (!Number.isFinite(preview.totalAPagar) || preview.totalAPagar <= 0) {
      errores.push('Total a pagar inválido');
    }

    if (preview.numeroCuotas <= 0) {
      errores.push('Número de cuotas inválido');
    }

    // Si hay errores, lanzar excepción con todos los detalles
    if (errores.length > 0) {
      throw new BadRequestException(
        `Error en cálculos del desembolso: ${errores.join(', ')}. ` +
        `Valores: cuotaNormal=${preview.cuotaNormal}, cuotaTotal=${preview.cuotaTotal}, ` +
        `montoAutorizado=${preview.montoAutorizado}, numeroCuotas=${preview.numeroCuotas}`,
      );
    }
  }
}
