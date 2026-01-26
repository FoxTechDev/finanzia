import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DecisionComite, TipoDecisionComite } from './entities/decision-comite.entity';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { SolicitudHistorial } from '../solicitud/entities/solicitud-historial.entity';
import { DecisionComiteDto } from './dto/decision-comite.dto';
import { EstadoSolicitudService } from '../../catalogos/estado-solicitud/estado-solicitud.service';

@Injectable()
export class ComiteService {
  constructor(
    @InjectRepository(DecisionComite)
    private readonly decisionComiteRepository: Repository<DecisionComite>,
    @InjectRepository(Solicitud)
    private readonly solicitudRepository: Repository<Solicitud>,
    @InjectRepository(SolicitudHistorial)
    private readonly historialRepository: Repository<SolicitudHistorial>,
    private readonly estadoSolicitudService: EstadoSolicitudService,
    private readonly dataSource: DataSource,
  ) {}

  async findPendientes(filters?: {
    lineaCreditoId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    montoMinimo?: number;
    montoMaximo?: number;
  }): Promise<Solicitud[]> {
    const queryBuilder = this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.persona', 'persona')
      .leftJoinAndSelect('solicitud.lineaCredito', 'lineaCredito')
      .leftJoinAndSelect('solicitud.tipoCredito', 'tipoCredito')
      .leftJoinAndSelect('solicitud.estado', 'estado')
      .where('estado.codigo = :estadoCodigo', { estadoCodigo: 'EN_COMITE' });

    if (filters?.lineaCreditoId) {
      queryBuilder.andWhere('solicitud.lineaCreditoId = :lineaCreditoId', {
        lineaCreditoId: filters.lineaCreditoId,
      });
    }
    if (filters?.fechaDesde) {
      queryBuilder.andWhere('solicitud.fechaTrasladoComite >= :fechaDesde', {
        fechaDesde: filters.fechaDesde,
      });
    }
    if (filters?.fechaHasta) {
      queryBuilder.andWhere('solicitud.fechaTrasladoComite <= :fechaHasta', {
        fechaHasta: filters.fechaHasta,
      });
    }
    if (filters?.montoMinimo) {
      queryBuilder.andWhere('solicitud.montoSolicitado >= :montoMinimo', {
        montoMinimo: filters.montoMinimo,
      });
    }
    if (filters?.montoMaximo) {
      queryBuilder.andWhere('solicitud.montoSolicitado <= :montoMaximo', {
        montoMaximo: filters.montoMaximo,
      });
    }

    return queryBuilder.orderBy('solicitud.fechaTrasladoComite', 'ASC').getMany();
  }

  async findHistorial(filters?: {
    lineaCreditoId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    tipoDecision?: TipoDecisionComite;
  }): Promise<DecisionComite[]> {
    const queryBuilder = this.decisionComiteRepository
      .createQueryBuilder('decision')
      .leftJoinAndSelect('decision.solicitud', 'solicitud')
      .leftJoinAndSelect('solicitud.persona', 'persona')
      .leftJoinAndSelect('solicitud.lineaCredito', 'lineaCredito')
      .leftJoinAndSelect('solicitud.tipoCredito', 'tipoCredito');

    if (filters?.lineaCreditoId) {
      queryBuilder.andWhere('solicitud.lineaCreditoId = :lineaCreditoId', {
        lineaCreditoId: filters.lineaCreditoId,
      });
    }
    if (filters?.fechaDesde) {
      queryBuilder.andWhere('decision.fechaDecision >= :fechaDesde', {
        fechaDesde: filters.fechaDesde,
      });
    }
    if (filters?.fechaHasta) {
      queryBuilder.andWhere('decision.fechaDecision <= :fechaHasta', {
        fechaHasta: filters.fechaHasta,
      });
    }
    if (filters?.tipoDecision) {
      queryBuilder.andWhere('decision.tipoDecision = :tipoDecision', {
        tipoDecision: filters.tipoDecision,
      });
    }

    return queryBuilder.orderBy('decision.fechaDecision', 'DESC').getMany();
  }

  /**
   * Registrar decisión del comité de crédito.
   * El comité puede: OBSERVAR, DENEGAR o APROBAR.
   * - OBSERVADA: permite al asesor modificar y reenviar
   * - DENEGADA: estado final, no se puede modificar
   * - APROBADA: solicitud aprobada, lista para desembolso
   */
  async registrarDecision(
    solicitudId: number,
    decisionDto: DecisionComiteDto,
  ): Promise<DecisionComite> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id: solicitudId },
      relations: ['estado'],
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${solicitudId} no encontrada`);
    }

    if (solicitud.estado.codigo !== 'EN_COMITE') {
      throw new BadRequestException(
        `Solo se puede registrar decisión para solicitudes en estado EN_COMITE. Estado actual: ${solicitud.estado.nombre}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear registro de decisión
      const decision = queryRunner.manager.create(DecisionComite, {
        solicitudId,
        tipoDecision: decisionDto.tipoDecision,
        observaciones: decisionDto.observaciones,
        condicionesEspeciales: decisionDto.condicionesEspeciales,
        montoAutorizado: decisionDto.montoAutorizado,
        plazoAutorizado: decisionDto.plazoAutorizado,
        tasaAutorizada: decisionDto.tasaAutorizada,
        usuarioId: decisionDto.usuarioId,
        nombreUsuario: decisionDto.nombreUsuario,
        fechaDecision: new Date(),
      });

      const savedDecision = await queryRunner.manager.save(DecisionComite, decision);

      // Determinar el nuevo estado según la decisión del comité
      const estadoAnteriorCodigo = solicitud.estado.codigo;
      let nuevoEstadoCodigo: string;

      // Preparar datos para actualizar la solicitud
      const updateData: Partial<Solicitud> = {
        fechaDecisionComite: new Date(),
      };

      if (decisionDto.observaciones) {
        updateData.observacionesComite = decisionDto.observaciones;
      }

      switch (decisionDto.tipoDecision) {
        case TipoDecisionComite.AUTORIZADA:
          nuevoEstadoCodigo = 'APROBADA';
          updateData.montoAprobado = decisionDto.montoAutorizado || solicitud.montoSolicitado;
          updateData.plazoAprobado = decisionDto.plazoAutorizado || solicitud.plazoSolicitado;
          updateData.tasaInteresAprobada = decisionDto.tasaAutorizada || solicitud.tasaInteresPropuesta;
          updateData.fechaAprobacion = new Date();
          break;
        case TipoDecisionComite.DENEGADA:
          nuevoEstadoCodigo = 'DENEGADA';
          updateData.fechaDenegacion = new Date();
          if (decisionDto.observaciones) {
            updateData.motivoRechazo = decisionDto.observaciones;
          }
          break;
        case TipoDecisionComite.OBSERVADA:
          nuevoEstadoCodigo = 'OBSERVADA';
          break;
      }

      // Obtener el nuevo estado de la base de datos
      const nuevoEstado = await this.estadoSolicitudService.findByCodigo(nuevoEstadoCodigo);
      updateData.estadoId = nuevoEstado.id;

      // Actualizar solicitud usando update en lugar de save
      await queryRunner.manager.update(Solicitud, solicitudId, updateData);

      // Crear registro en historial
      const historial = queryRunner.manager.create(SolicitudHistorial, {
        solicitudId,
        estadoAnterior: estadoAnteriorCodigo,
        estadoNuevo: nuevoEstadoCodigo,
        observacion: `Decisión del comité: ${decisionDto.tipoDecision}${decisionDto.observaciones ? '. ' + decisionDto.observaciones : ''}`,
        usuarioId: decisionDto.usuarioId,
        nombreUsuario: decisionDto.nombreUsuario,
      });
      await queryRunner.manager.save(SolicitudHistorial, historial);

      await queryRunner.commitTransaction();
      return savedDecision;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findDecisionesBySolicitud(solicitudId: number): Promise<DecisionComite[]> {
    return this.decisionComiteRepository.find({
      where: { solicitudId },
      order: { fechaDecision: 'DESC' },
    });
  }

  async getEstadisticasPendientes(): Promise<{
    totalPendientes: number;
    montoTotal: number;
  }> {
    const result = await this.solicitudRepository
      .createQueryBuilder('solicitud')
      .leftJoin('solicitud.estado', 'estado')
      .select('COUNT(*)', 'totalPendientes')
      .addSelect('COALESCE(SUM(solicitud.montoSolicitado), 0)', 'montoTotal')
      .where('estado.codigo = :estadoCodigo', { estadoCodigo: 'EN_COMITE' })
      .getRawOne();

    return {
      totalPendientes: parseInt(result.totalPendientes) || 0,
      montoTotal: parseFloat(result.montoTotal) || 0,
    };
  }
}
