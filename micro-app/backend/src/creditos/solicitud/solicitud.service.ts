import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { SolicitudHistorial } from './entities/solicitud-historial.entity';
import { PlanPagoSolicitud } from './entities/plan-pago-solicitud.entity';
import { RecargoSolicitud } from './entities/recargo-solicitud.entity';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { CambiarEstadoSolicitudDto } from './dto/cambiar-estado-solicitud.dto';
import { UpdateAnalisisAsesorDto } from './dto/update-analisis-asesor.dto';
import { TrasladarComiteDto } from '../comite/dto/trasladar-comite.dto';
import { CalcularPlanPagoDto, RecargoDto } from './dto/calcular-plan-pago.dto';
import { GuardarPlanPagoDto } from './dto/guardar-plan-pago.dto';
import { TipoCalculo } from '../desembolso/entities/tipo-deduccion.entity';
import { TipoCreditoService } from '../tipo-credito/tipo-credito.service';
import { EstadoSolicitudService } from '../../catalogos/estado-solicitud/estado-solicitud.service';
import { PeriodicidadPagoService } from '../../catalogos/periodicidad-pago/periodicidad-pago.service';
import { CalculoInteresService } from '../desembolso/services/calculo-interes.service';
import { PlanPagoService } from '../desembolso/services/plan-pago.service';
import { PeriodicidadPago } from '../desembolso/entities/prestamo.entity';

@Injectable()
export class SolicitudService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly solicitudRepository: Repository<Solicitud>,
    @InjectRepository(SolicitudHistorial)
    private readonly historialRepository: Repository<SolicitudHistorial>,
    @InjectRepository(PlanPagoSolicitud)
    private readonly planPagoSolicitudRepository: Repository<PlanPagoSolicitud>,
    @InjectRepository(RecargoSolicitud)
    private readonly recargoSolicitudRepository: Repository<RecargoSolicitud>,
    private readonly tipoCreditoService: TipoCreditoService,
    private readonly estadoSolicitudService: EstadoSolicitudService,
    private readonly periodicidadPagoService: PeriodicidadPagoService,
    private readonly calculoInteresService: CalculoInteresService,
    private readonly planPagoService: PlanPagoService,
    private readonly dataSource: DataSource,
  ) {}

  private async generarNumeroSolicitud(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SOL-${year}-`;

    const lastSolicitud = await this.solicitudRepository
      .createQueryBuilder('solicitud')
      .where('solicitud.numeroSolicitud LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('solicitud.id', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastSolicitud) {
      const lastNumber = parseInt(lastSolicitud.numeroSolicitud.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }

  async create(createDto: CreateSolicitudDto): Promise<Solicitud> {
    // Obtener el código de periodicidad si se especificó
    let periodicidadCodigo: string | undefined;
    if (createDto.periodicidadPagoId) {
      const periodicidad = await this.periodicidadPagoService.findOne(createDto.periodicidadPagoId);
      periodicidadCodigo = periodicidad.codigo;
    }

    // Validar parámetros contra el tipo de crédito (considerando la periodicidad)
    const validacion = await this.tipoCreditoService.validarParametros(
      createDto.tipoCreditoId,
      createDto.montoSolicitado,
      createDto.plazoSolicitado,
      createDto.tasaInteresPropuesta,
      periodicidadCodigo,
    );

    if (!validacion.valid) {
      throw new BadRequestException(validacion.errors.join(', '));
    }

    // Obtener el estado REGISTRADA desde la base de datos
    const estadoRegistrada = await this.estadoSolicitudService.findByCodigo('REGISTRADA');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const numeroSolicitud = await this.generarNumeroSolicitud();

      // Preparar datos de la solicitud con fechas convertidas a formato YYYY-MM-DD para MySQL DATE columns
      const solicitudData: any = {
        ...createDto,
        numeroSolicitud,
        estadoId: estadoRegistrada.id,
      };

      // Convertir fechaDesdePago si viene como ISO timestamp
      if (createDto.fechaDesdePago) {
        const fecha = new Date(createDto.fechaDesdePago);
        solicitudData.fechaDesdePago = fecha.toISOString().split('T')[0];
      }

      // Convertir fechaHastaPago si viene como ISO timestamp
      if (createDto.fechaHastaPago) {
        const fecha = new Date(createDto.fechaHastaPago);
        solicitudData.fechaHastaPago = fecha.toISOString().split('T')[0];
      }

      // Convertir fechaSolicitud si viene como ISO timestamp
      if (createDto.fechaSolicitud) {
        const fecha = new Date(createDto.fechaSolicitud);
        solicitudData.fechaSolicitud = fecha.toISOString().split('T')[0];
      }

      const solicitud = queryRunner.manager.create(Solicitud, solicitudData);

      const savedSolicitud = await queryRunner.manager.save(solicitud);

      // Crear registro en historial
      const historial = queryRunner.manager.create(SolicitudHistorial, {
        solicitudId: savedSolicitud.id,
        estadoAnterior: estadoRegistrada.codigo,
        estadoNuevo: estadoRegistrada.codigo,
        observacion: 'Solicitud creada',
      });
      await queryRunner.manager.save(SolicitudHistorial, historial);

      await queryRunner.commitTransaction();
      return this.findOne(savedSolicitud.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters?: {
    estado?: string; // Ahora recibe el código del estado
    personaId?: number;
    lineaCreditoId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<Solicitud[]> {
    const queryBuilder = this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.persona', 'persona')
      .leftJoinAndSelect('solicitud.lineaCredito', 'lineaCredito')
      .leftJoinAndSelect('solicitud.tipoCredito', 'tipoCredito')
      .leftJoinAndSelect('solicitud.estado', 'estado')
      .leftJoinAndSelect('solicitud.periodicidadPago', 'periodicidadPago');

    if (filters?.estado) {
      queryBuilder.andWhere('estado.codigo = :estadoCodigo', { estadoCodigo: filters.estado });
    }
    if (filters?.personaId) {
      queryBuilder.andWhere('solicitud.personaId = :personaId', { personaId: filters.personaId });
    }
    if (filters?.lineaCreditoId) {
      queryBuilder.andWhere('solicitud.lineaCreditoId = :lineaCreditoId', {
        lineaCreditoId: filters.lineaCreditoId,
      });
    }
    if (filters?.fechaDesde) {
      queryBuilder.andWhere('solicitud.fechaSolicitud >= :fechaDesde', {
        fechaDesde: filters.fechaDesde,
      });
    }
    if (filters?.fechaHasta) {
      queryBuilder.andWhere('solicitud.fechaSolicitud <= :fechaHasta', {
        fechaHasta: filters.fechaHasta,
      });
    }

    return queryBuilder.orderBy('solicitud.createdAt', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id },
      relations: [
        'persona',
        'lineaCredito',
        'tipoCredito',
        'historial',
        'periodicidadPago',
        'estado',
      ],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    return solicitud;
  }

  /**
   * Obtener solicitud con información completa incluyendo plan de pago calculado
   * Útil para la vista de consulta de solicitud
   */
  async findOneConPlanPago(id: number): Promise<any> {
    const solicitud = await this.findOne(id);

    // Determinar qué monto, plazo y tasa usar para el plan de pago
    // Si está aprobada, usar valores aprobados; si no, usar los solicitados
    const monto = solicitud.montoAprobado || solicitud.montoSolicitado;
    const plazo = solicitud.plazoAprobado || solicitud.plazoSolicitado;
    const tasaInteres = solicitud.tasaInteresAprobada || solicitud.tasaInteresPropuesta;

    // Solo calcular plan de pago si hay periodicidad definida
    let planPago = null;
    if (solicitud.periodicidadPago) {
      try {
        // Por defecto usar AMORTIZADO, se puede ajustar según el tipo de crédito
        // En el futuro se puede agregar un campo tipoInteres en la entidad TipoCredito
        const tipoInteres = 'AMORTIZADO'; // Por defecto

        const resultadoCalculo = await this.calcularPlanPago({
          monto,
          plazo,
          tasaInteres,
          tipoInteres: tipoInteres as any,
          periodicidad: solicitud.periodicidadPago.codigo as any,
          fechaPrimeraCuota: solicitud.fechaDesdePago ? solicitud.fechaDesdePago.toString() : undefined,
        });
        planPago = resultadoCalculo;
      } catch (error) {
        // Si hay error al calcular el plan de pago, lo dejamos como null
        console.error('Error al calcular plan de pago:', error.message);
      }
    }

    return {
      ...solicitud,
      planPago,
    };
  }

  async findByNumero(numeroSolicitud: string): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { numeroSolicitud },
      relations: ['persona', 'lineaCredito', 'tipoCredito', 'historial', 'periodicidadPago'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud ${numeroSolicitud} no encontrada`);
    }

    return solicitud;
  }

  async update(id: number, updateDto: UpdateSolicitudDto): Promise<Solicitud> {
    // Cargar solicitud sin relación historial para evitar problemas al guardar
    const solicitud = await this.solicitudRepository.findOne({
      where: { id },
      relations: ['estado'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    // Solo se puede modificar si está en estado REGISTRADA u OBSERVADA
    const estadosPermitidos = ['REGISTRADA', 'OBSERVADA'];
    if (!estadosPermitidos.includes(solicitud.estado.codigo)) {
      throw new BadRequestException(
        `No se puede modificar una solicitud en estado ${solicitud.estado.nombre}`,
      );
    }

    // Usar update en lugar de save para evitar problemas con relaciones
    await this.solicitudRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async cambiarEstado(
    id: number,
    cambioDto: CambiarEstadoSolicitudDto,
  ): Promise<Solicitud> {
    // Cargar solicitud sin la relación historial para evitar problemas al guardar
    const solicitud = await this.solicitudRepository.findOne({
      where: { id },
      relations: ['estado'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    const estadoAnteriorCodigo = solicitud.estado.codigo;

    // Obtener el nuevo estado de la base de datos
    const nuevoEstado = await this.estadoSolicitudService.findByCodigo(cambioDto.nuevoEstadoCodigo);

    // Validar transiciones de estado permitidas
    this.validarTransicionEstado(estadoAnteriorCodigo, nuevoEstado.codigo);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Preparar datos para actualizar
      const updateData: Partial<Solicitud> = {
        estadoId: nuevoEstado.id,
      };

      // Lógica específica por estado
      if (nuevoEstado.codigo === 'APROBADA') {
        updateData.fechaAprobacion = new Date();
        updateData.montoAprobado = cambioDto.montoAprobado || solicitud.montoSolicitado;
        updateData.plazoAprobado = cambioDto.plazoAprobado || solicitud.plazoSolicitado;
        updateData.tasaInteresAprobada = cambioDto.tasaInteresAprobada || solicitud.tasaInteresPropuesta;
        updateData.fechaDecisionComite = new Date();
        if (cambioDto.usuarioId) {
          updateData.aprobadorId = cambioDto.usuarioId;
          if (cambioDto.nombreUsuario) {
            updateData.nombreAprobador = cambioDto.nombreUsuario;
          }
        }
      }

      if (nuevoEstado.codigo === 'DENEGADA') {
        updateData.fechaDenegacion = new Date();
        updateData.fechaDecisionComite = new Date();
        if (cambioDto.motivoRechazo) {
          updateData.motivoRechazo = cambioDto.motivoRechazo;
        }
      }

      if (nuevoEstado.codigo === 'OBSERVADA') {
        updateData.fechaDecisionComite = new Date();
        if (cambioDto.observacion) {
          updateData.observacionesComite = cambioDto.observacion;
        }
      }

      // Actualizar solicitud usando update en lugar de save
      await queryRunner.manager.update(Solicitud, id, updateData);

      // Crear registro en historial
      const historial = queryRunner.manager.create(SolicitudHistorial, {
        solicitudId: id,
        estadoAnterior: estadoAnteriorCodigo,
        estadoNuevo: nuevoEstado.codigo,
        observacion: cambioDto.observacion,
        usuarioId: cambioDto.usuarioId,
        nombreUsuario: cambioDto.nombreUsuario,
      });
      await queryRunner.manager.save(SolicitudHistorial, historial);

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Valida las transiciones de estado permitidas según el nuevo flujo:
   * REGISTRADA → ANALIZADA (automático al ingresar análisis)
   * ANALIZADA → EN_COMITE (asesor traslada a comité)
   * EN_COMITE → OBSERVADA | DENEGADA | APROBADA (decisiones del comité)
   * OBSERVADA → EN_COMITE (asesor modifica y reenvía)
   * APROBADA → DESEMBOLSADA (al realizar desembolso)
   * DENEGADA = estado final
   */
  private validarTransicionEstado(
    estadoActualCodigo: string,
    nuevoEstadoCodigo: string,
  ): void {
    const transicionesPermitidas: Record<string, string[]> = {
      'REGISTRADA': ['ANALIZADA'], // Automático al ingresar análisis
      'ANALIZADA': ['EN_COMITE'], // Única acción del asesor: trasladar a comité
      'EN_COMITE': ['OBSERVADA', 'DENEGADA', 'APROBADA'], // Decisiones del comité
      'OBSERVADA': ['EN_COMITE'], // Asesor modifica y reenvía a comité
      'APROBADA': ['DESEMBOLSADA'], // Al realizar desembolso
      'DENEGADA': [], // Estado final, no se puede modificar
      'DESEMBOLSADA': [], // Estado final
    };

    const permitidas = transicionesPermitidas[estadoActualCodigo];

    if (!permitidas) {
      throw new BadRequestException(
        `Estado actual '${estadoActualCodigo}' no reconocido`,
      );
    }

    if (!permitidas.includes(nuevoEstadoCodigo)) {
      throw new BadRequestException(
        `No se puede cambiar de estado '${estadoActualCodigo}' a '${nuevoEstadoCodigo}'. ` +
        `Transiciones permitidas: ${permitidas.length > 0 ? permitidas.join(', ') : 'ninguna (estado final)'}`,
      );
    }
  }

  async getHistorial(id: number): Promise<SolicitudHistorial[]> {
    return this.historialRepository.find({
      where: { solicitudId: id },
      order: { fechaCambio: 'DESC' },
    });
  }

  async remove(id: number): Promise<void> {
    const solicitud = await this.findOne(id);

    if (solicitud.estado.codigo !== 'REGISTRADA') {
      throw new BadRequestException(
        'Solo se pueden eliminar solicitudes en estado REGISTRADA',
      );
    }

    await this.solicitudRepository.remove(solicitud);
  }

  /**
   * Actualizar análisis del asesor de negocio.
   * Cambia automáticamente el estado a ANALIZADA cuando el asesor ingresa su análisis.
   */
  async actualizarAnalisisAsesor(
    id: number,
    updateDto: UpdateAnalisisAsesorDto,
  ): Promise<Solicitud> {
    // Cargar solicitud sin la relación historial para evitar problemas al guardar
    const solicitud = await this.solicitudRepository.findOne({
      where: { id },
      relations: ['estado'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    // Solo se puede modificar el análisis si está en estado REGISTRADA, ANALIZADA u OBSERVADA
    const estadosPermitidos = ['REGISTRADA', 'ANALIZADA', 'OBSERVADA'];
    if (!estadosPermitidos.includes(solicitud.estado.codigo)) {
      throw new BadRequestException(
        `No se puede modificar el análisis de una solicitud en estado ${solicitud.estado.nombre}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const estadoAnteriorCodigo = solicitud.estado.codigo;
      const debeCambiarEstado = estadoAnteriorCodigo === 'REGISTRADA';

      // Preparar datos para actualizar
      const updateData: Partial<Solicitud> = {
        ...updateDto,
        fechaAnalisis: new Date(),
      };

      // Si está en estado REGISTRADA, cambiar automáticamente a ANALIZADA
      if (debeCambiarEstado) {
        const estadoAnalizada = await this.estadoSolicitudService.findByCodigo('ANALIZADA');
        updateData.estadoId = estadoAnalizada.id;
      }

      // Actualizar solicitud usando update en lugar de save
      await queryRunner.manager.update(Solicitud, id, updateData);

      // Crear registro en historial del cambio de estado si aplica
      if (debeCambiarEstado) {
        const historial = queryRunner.manager.create(SolicitudHistorial, {
          solicitudId: id,
          estadoAnterior: estadoAnteriorCodigo,
          estadoNuevo: 'ANALIZADA',
          observacion: 'Análisis del asesor ingresado - cambio automático a ANALIZADA',
        });
        await queryRunner.manager.save(SolicitudHistorial, historial);
      }

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Trasladar solicitud al comité de crédito.
   * Única acción que puede hacer el asesor después del análisis.
   * Solo se puede trasladar desde estado ANALIZADA.
   */
  async trasladarAComite(
    id: number,
    trasladarDto: TrasladarComiteDto,
  ): Promise<Solicitud> {
    // Cargar solicitud sin la relación historial para evitar problemas al guardar
    const solicitud = await this.solicitudRepository.findOne({
      where: { id },
      relations: ['estado'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    // Se puede trasladar a comité desde ANALIZADA u OBSERVADA (re-envío después de correcciones)
    const estadosPermitidos = ['ANALIZADA', 'OBSERVADA'];
    if (!estadosPermitidos.includes(solicitud.estado.codigo)) {
      throw new BadRequestException(
        `Solo se puede trasladar a comité desde estado ANALIZADA u OBSERVADA. Estado actual: ${solicitud.estado.nombre}`,
      );
    }

    const estadoEnComite = await this.estadoSolicitudService.findByCodigo('EN_COMITE');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const estadoAnteriorCodigo = solicitud.estado.codigo;

      // Preparar datos para actualizar
      const updateData: Partial<Solicitud> = {
        estadoId: estadoEnComite.id,
        fechaTrasladoComite: new Date(),
      };

      if (trasladarDto.observacionAsesor) {
        updateData.observaciones = trasladarDto.observacionAsesor;
      }

      // Actualizar solicitud usando update en lugar de save
      await queryRunner.manager.update(Solicitud, id, updateData);

      // Crear registro en historial
      const historial = queryRunner.manager.create(SolicitudHistorial, {
        solicitudId: id,
        estadoAnterior: estadoAnteriorCodigo,
        estadoNuevo: 'EN_COMITE',
        observacion: `Trasladada a Comité de Crédito${trasladarDto.observacionAsesor ? '. ' + trasladarDto.observacionAsesor : ''}`,
        usuarioId: trasladarDto.usuarioId,
        nombreUsuario: trasladarDto.nombreUsuario,
      });
      await queryRunner.manager.save(SolicitudHistorial, historial);

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Calcula y previsualiza el plan de pago sin guardar nada
   * Útil para que el usuario vea cómo quedaría el crédito antes de aprobarlo
   *
   * NUEVA LÓGICA:
   * - El plazo SIEMPRE se ingresa en meses (mínimo 1 mes)
   * - Para periodicidad DIARIA: numeroCuotas es OBLIGATORIO (usuario lo define)
   * - Para otras periodicidades: numeroCuotas se calcula automáticamente según el plazo
   * - Soporta recargos opcionales que se suman a las cuotas
   */
  async calcularPlanPago(dto: CalcularPlanPagoDto): Promise<{
    cuotaNormal: number;
    totalInteres: number;
    totalRecargos: number;
    totalPagar: number;
    numeroCuotas: number;
    planPago: Array<{
      numeroCuota: number;
      fechaVencimiento: Date;
      capital: number;
      interes: number;
      recargos: number;
      cuotaTotal: number;
      saldoCapital: number;
    }>;
  }> {
    // Validar parámetros básicos
    if (dto.monto <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }
    if (dto.plazo < 1) {
      throw new BadRequestException('El plazo debe ser mínimo 1 mes');
    }
    if (dto.tasaInteres < 0) {
      throw new BadRequestException('La tasa de interés no puede ser negativa');
    }

    // Validación específica para periodicidad DIARIA
    if (dto.periodicidad === PeriodicidadPago.DIARIO) {
      if (!dto.numeroCuotas || dto.numeroCuotas < 1) {
        throw new BadRequestException(
          'Para periodicidad DIARIA, el campo numeroCuotas es obligatorio y debe ser mayor a 0'
        );
      }
    }

    // Calcular fechaPrimeraCuota
    // IMPORTANTE: La primera cuota debe iniciar el día POSTERIOR a la fecha de solicitud
    let fechaPrimeraCuota: Date;
    if (dto.fechaPrimeraCuota) {
      fechaPrimeraCuota = new Date(dto.fechaPrimeraCuota);
      // Agregar 1 día para que la primera cuota sea el día posterior
      fechaPrimeraCuota.setDate(fechaPrimeraCuota.getDate() + 1);
    } else {
      // Por defecto: hoy + 30 días (ya incluye el día posterior)
      fechaPrimeraCuota = new Date();
      fechaPrimeraCuota.setDate(fechaPrimeraCuota.getDate() + 30);
    }

    // NUEVA LÓGICA: Determinar el número de cuotas según la periodicidad
    let numeroCuotasCalculado: number;
    let plazoParaCalculo: number;
    let usarPlazoEnCuotas: boolean;

    if (dto.periodicidad === PeriodicidadPago.DIARIO) {
      // Para DIARIA: usar el numeroCuotas proporcionado por el usuario
      numeroCuotasCalculado = dto.numeroCuotas!;
      // El plazo sigue siendo en meses para el cálculo de interés
      plazoParaCalculo = dto.plazo;
      // Indicamos que vamos a pasar el número de cuotas directamente
      usarPlazoEnCuotas = true;
      // Para el cálculo, pasamos el número de cuotas como "plazo"
      plazoParaCalculo = numeroCuotasCalculado;
    } else {
      // Para otras periodicidades: calcular automáticamente según el plazo en meses
      plazoParaCalculo = dto.plazo;
      usarPlazoEnCuotas = false;
      // El CalculoInteresService calculará el número de cuotas automáticamente
      numeroCuotasCalculado = this.calculoInteresService.calcularNumeroCuotas(
        dto.plazo,
        dto.periodicidad,
      );
    }

    // Calcular el plan de pagos usando CalculoInteresService
    // IMPORTANTE: Para DIARIA, necesitamos pasar el plazo en meses para el cálculo de interés
    // pero el número de cuotas ya definido por el usuario
    let resultadoCalculo;

    if (dto.periodicidad === PeriodicidadPago.DIARIO) {
      // Para DIARIA: cálculo especial considerando que el interés se calcula sobre meses
      // pero el número de cuotas es definido por el usuario
      resultadoCalculo = this.calculoInteresService.calcularConCuotasPersonalizadas(
        dto.monto,
        dto.tasaInteres,
        dto.plazo, // plazo en meses para el interés
        numeroCuotasCalculado, // número de cuotas definido por usuario
        dto.tipoInteres,
        dto.periodicidad,
      );
    } else {
      // Para otras periodicidades: cálculo normal
      resultadoCalculo = this.calculoInteresService.calcular(
        dto.monto,
        dto.tasaInteres,
        plazoParaCalculo,
        dto.tipoInteres,
        dto.periodicidad,
        usarPlazoEnCuotas,
      );
    }

    // Calcular recargos si se proporcionaron
    const recargosCalculados = dto.recargos?.map((recargo) =>
      this.planPagoService.calcularMontoRecargo(
        {
          nombre: recargo.nombre,
          tipoCalculo: recargo.tipo,
          valor: recargo.valor,
          aplicaDesde: recargo.aplicaDesde,
          aplicaHasta: recargo.aplicaHasta,
        },
        resultadoCalculo.cuotaNormal,
        recargo.nombre,
      ),
    ) || [];

    // Generar plan de pago con fechas y recargos
    const planPagoConFechas = this.planPagoService.generarPlanPago(
      fechaPrimeraCuota,
      dto.periodicidad,
      resultadoCalculo.cuotas,
      recargosCalculados,
      resultadoCalculo.cuotaNormal,
    );

    // Calcular total de recargos
    const totalRecargos = this.planPagoService.calcularTotalRecargos(
      recargosCalculados,
      resultadoCalculo.numeroCuotas,
    );

    // Mapear a formato de respuesta
    const planPago = planPagoConFechas.map((cuota) => ({
      numeroCuota: cuota.numeroCuota,
      fechaVencimiento: cuota.fechaVencimiento,
      capital: cuota.capital,
      interes: cuota.interes,
      recargos: cuota.recargos,
      cuotaTotal: cuota.cuotaTotal,
      saldoCapital: cuota.saldoCapital,
    }));

    return {
      cuotaNormal: resultadoCalculo.cuotaNormal,
      totalInteres: resultadoCalculo.totalInteres,
      totalRecargos,
      totalPagar: resultadoCalculo.totalPagar + totalRecargos,
      numeroCuotas: resultadoCalculo.numeroCuotas,
      planPago,
    };
  }

  /**
   * Guarda el plan de pago calculado en la base de datos
   * Este método calcula y persiste el plan de pago de una solicitud
   * Se usa cuando la solicitud es aprobada y se quiere guardar el plan
   */
  async guardarPlanPago(
    solicitudId: number,
    dto: GuardarPlanPagoDto,
  ): Promise<{
    cuotaNormal: number;
    totalInteres: number;
    totalRecargos: number;
    totalPagar: number;
    numeroCuotas: number;
    planPagoGuardado: PlanPagoSolicitud[];
    recargosGuardados: RecargoSolicitud[];
  }> {
    // Verificar que la solicitud exista
    const solicitud = await this.findOne(solicitudId);

    // Calcular el plan de pago primero
    const planCalculado = await this.calcularPlanPago(dto);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Eliminar plan de pago anterior si existe
      await queryRunner.manager.delete(PlanPagoSolicitud, { solicitudId });
      await queryRunner.manager.delete(RecargoSolicitud, { solicitudId });

      // Guardar el plan de pago
      const planPagoEntities = planCalculado.planPago.map((cuota) =>
        queryRunner.manager.create(PlanPagoSolicitud, {
          solicitudId,
          numeroCuota: cuota.numeroCuota,
          fechaVencimiento: cuota.fechaVencimiento,
          capital: cuota.capital,
          interes: cuota.interes,
          recargos: cuota.recargos,
          cuotaTotal: cuota.cuotaTotal,
          saldoCapital: cuota.saldoCapital,
        }),
      );

      const planPagoGuardado = await queryRunner.manager.save(
        PlanPagoSolicitud,
        planPagoEntities,
      );

      // Guardar los recargos si existen
      let recargosGuardados: RecargoSolicitud[] = [];
      if (dto.recargos && dto.recargos.length > 0) {
        // Calcular recargos
        const recargosCalculados = dto.recargos.map((recargo) =>
          this.planPagoService.calcularMontoRecargo(
            {
              nombre: recargo.nombre,
              tipoCalculo: recargo.tipo,
              valor: recargo.valor,
              aplicaDesde: recargo.aplicaDesde,
              aplicaHasta: recargo.aplicaHasta,
            },
            planCalculado.cuotaNormal,
            recargo.nombre,
          ),
        );

        const recargoEntities = recargosCalculados.map((recargo) =>
          queryRunner.manager.create(RecargoSolicitud, {
            solicitudId,
            nombre: recargo.nombre,
            tipo: recargo.tipoCalculo,
            valor: recargo.valor,
            montoCalculado: recargo.montoCalculado,
            aplicaDesde: recargo.aplicaDesde || 1,
            aplicaHasta: recargo.aplicaHasta || planCalculado.numeroCuotas,
            activo: true,
          }),
        );

        recargosGuardados = await queryRunner.manager.save(
          RecargoSolicitud,
          recargoEntities,
        );
      }

      await queryRunner.commitTransaction();

      return {
        cuotaNormal: planCalculado.cuotaNormal,
        totalInteres: planCalculado.totalInteres,
        totalRecargos: planCalculado.totalRecargos,
        totalPagar: planCalculado.totalPagar,
        numeroCuotas: planCalculado.numeroCuotas,
        planPagoGuardado,
        recargosGuardados,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene el plan de pago guardado de una solicitud
   * Retorna el plan de pago con los recargos aplicados
   */
  async obtenerPlanPagoGuardado(solicitudId: number): Promise<{
    solicitud: Solicitud;
    planPago: PlanPagoSolicitud[];
    recargos: RecargoSolicitud[];
    totales: {
      cuotaNormal: number;
      totalCapital: number;
      totalInteres: number;
      totalRecargos: number;
      totalPagar: number;
    };
  }> {
    const solicitud = await this.findOne(solicitudId);

    const planPago = await this.planPagoSolicitudRepository.find({
      where: { solicitudId },
      order: { numeroCuota: 'ASC' },
    });

    if (!planPago || planPago.length === 0) {
      throw new NotFoundException(
        `No existe plan de pago guardado para la solicitud ${solicitudId}`,
      );
    }

    const recargos = await this.recargoSolicitudRepository.find({
      where: { solicitudId },
      order: { id: 'ASC' },
    });

    // Calcular totales
    const totalCapital = planPago.reduce(
      (sum, cuota) => sum + Number(cuota.capital),
      0,
    );
    const totalInteres = planPago.reduce(
      (sum, cuota) => sum + Number(cuota.interes),
      0,
    );
    const totalRecargos = planPago.reduce(
      (sum, cuota) => sum + Number(cuota.recargos),
      0,
    );
    const totalPagar = planPago.reduce(
      (sum, cuota) => sum + Number(cuota.cuotaTotal),
      0,
    );

    // Calcular cuota normal (promedio de las cuotas)
    const cuotaNormal = totalPagar / planPago.length;

    return {
      solicitud,
      planPago,
      recargos,
      totales: {
        cuotaNormal: Math.round(cuotaNormal * 100) / 100,
        totalCapital: Math.round(totalCapital * 100) / 100,
        totalInteres: Math.round(totalInteres * 100) / 100,
        totalRecargos: Math.round(totalRecargos * 100) / 100,
        totalPagar: Math.round(totalPagar * 100) / 100,
      },
    };
  }

  // Estadísticas
  async getEstadisticas(): Promise<any> {
    const stats = await this.solicitudRepository
      .createQueryBuilder('solicitud')
      .select('solicitud.estado', 'estado')
      .addSelect('COUNT(*)', 'cantidad')
      .addSelect('SUM(solicitud.montoSolicitado)', 'montoTotal')
      .groupBy('solicitud.estado')
      .getRawMany();

    return stats;
  }
}
