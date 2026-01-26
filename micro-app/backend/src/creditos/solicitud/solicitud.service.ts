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
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { CambiarEstadoSolicitudDto } from './dto/cambiar-estado-solicitud.dto';
import { UpdateAnalisisAsesorDto } from './dto/update-analisis-asesor.dto';
import { TrasladarComiteDto } from '../comite/dto/trasladar-comite.dto';
import { TipoCreditoService } from '../tipo-credito/tipo-credito.service';
import { EstadoSolicitudService } from '../../catalogos/estado-solicitud/estado-solicitud.service';

@Injectable()
export class SolicitudService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly solicitudRepository: Repository<Solicitud>,
    @InjectRepository(SolicitudHistorial)
    private readonly historialRepository: Repository<SolicitudHistorial>,
    private readonly tipoCreditoService: TipoCreditoService,
    private readonly estadoSolicitudService: EstadoSolicitudService,
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
    // Validar parámetros contra el tipo de crédito
    const validacion = await this.tipoCreditoService.validarParametros(
      createDto.tipoCreditoId,
      createDto.montoSolicitado,
      createDto.plazoSolicitado,
      createDto.tasaInteresPropuesta,
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

      const solicitud = queryRunner.manager.create(Solicitud, {
        ...createDto,
        numeroSolicitud,
        estadoId: estadoRegistrada.id,
      });

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
      .leftJoinAndSelect('solicitud.estado', 'estado');

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
      ],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    return solicitud;
  }

  async findByNumero(numeroSolicitud: string): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { numeroSolicitud },
      relations: ['persona', 'lineaCredito', 'tipoCredito', 'historial'],
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

    // Solo se puede trasladar a comité desde estado ANALIZADA
    if (solicitud.estado.codigo !== 'ANALIZADA') {
      throw new BadRequestException(
        `Solo se puede trasladar a comité desde estado ANALIZADA. Estado actual: ${solicitud.estado.nombre}`,
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
