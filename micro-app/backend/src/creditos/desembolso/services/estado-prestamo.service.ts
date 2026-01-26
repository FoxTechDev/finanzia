import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoPrestamo } from '../entities/estado-prestamo.entity';

/**
 * DTO para crear estado
 */
export class CreateEstadoPrestamoDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  orden?: number;
  color?: string;
}

/**
 * DTO para actualizar estado
 */
export class UpdateEstadoPrestamoDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  orden?: number;
  color?: string;
}

/**
 * Servicio para gestión de estados de préstamos
 */
@Injectable()
export class EstadoPrestamoService {
  constructor(
    @InjectRepository(EstadoPrestamo)
    private estadoRepository: Repository<EstadoPrestamo>,
  ) {}

  /**
   * Lista todos los estados
   */
  async findAll(): Promise<EstadoPrestamo[]> {
    return this.estadoRepository.find({
      order: { orden: 'ASC', codigo: 'ASC' },
    });
  }

  /**
   * Lista solo los estados activos
   */
  async findActivos(): Promise<EstadoPrestamo[]> {
    return this.estadoRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', codigo: 'ASC' },
    });
  }

  /**
   * Obtiene un estado por ID
   */
  async findOne(id: number): Promise<EstadoPrestamo> {
    const estado = await this.estadoRepository.findOne({
      where: { id },
    });

    if (!estado) {
      throw new NotFoundException(`Estado con ID ${id} no encontrado`);
    }

    return estado;
  }

  /**
   * Obtiene un estado por código
   */
  async findByCodigo(codigo: string): Promise<EstadoPrestamo | null> {
    return this.estadoRepository.findOne({
      where: { codigo },
    });
  }

  /**
   * Crea un nuevo estado
   */
  async create(dto: CreateEstadoPrestamoDto): Promise<EstadoPrestamo> {
    // Verificar que no exista el código
    const existente = await this.findByCodigo(dto.codigo);
    if (existente) {
      throw new ConflictException(`Ya existe un estado con código ${dto.codigo}`);
    }

    const estado = this.estadoRepository.create(dto);
    return this.estadoRepository.save(estado);
  }

  /**
   * Actualiza un estado
   */
  async update(id: number, dto: UpdateEstadoPrestamoDto): Promise<EstadoPrestamo> {
    const estado = await this.findOne(id);

    Object.assign(estado, dto);
    return this.estadoRepository.save(estado);
  }

  /**
   * Elimina un estado
   */
  async remove(id: number): Promise<void> {
    const estado = await this.findOne(id);
    await this.estadoRepository.remove(estado);
  }

  /**
   * Inicializa los estados por defecto basados en el enum EstadoPrestamo
   */
  async inicializarEstadosPorDefecto(): Promise<void> {
    const estados = [
      {
        codigo: 'VIGENTE',
        nombre: 'Vigente',
        descripcion: 'Préstamo activo con pagos al día o con atraso mínimo',
        color: '#28a745',
        orden: 1,
      },
      {
        codigo: 'MORA',
        nombre: 'En Mora',
        descripcion: 'Préstamo con atraso en los pagos superior al plazo establecido',
        color: '#ffc107',
        orden: 2,
      },
      {
        codigo: 'CANCELADO',
        nombre: 'Cancelado',
        descripcion: 'Préstamo pagado completamente',
        color: '#6c757d',
        orden: 3,
      },
      {
        codigo: 'CASTIGADO',
        nombre: 'Castigado',
        descripcion: 'Préstamo considerado incobrable y registrado como pérdida',
        color: '#dc3545',
        orden: 4,
      },
    ];

    for (const estado of estados) {
      const existe = await this.findByCodigo(estado.codigo);
      if (!existe) {
        await this.create(estado);
      }
    }
  }
}
