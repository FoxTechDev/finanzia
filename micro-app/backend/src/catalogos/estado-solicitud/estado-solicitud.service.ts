import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoSolicitud } from './entities/estado-solicitud.entity';
import { CreateEstadoSolicitudDto } from './dto/create-estado-solicitud.dto';
import { UpdateEstadoSolicitudDto } from './dto/update-estado-solicitud.dto';

@Injectable()
export class EstadoSolicitudService {
  constructor(
    @InjectRepository(EstadoSolicitud)
    private readonly estadoSolicitudRepository: Repository<EstadoSolicitud>,
  ) {}

  async create(createEstadoSolicitudDto: CreateEstadoSolicitudDto): Promise<EstadoSolicitud> {
    const exists = await this.estadoSolicitudRepository.findOne({
      where: { codigo: createEstadoSolicitudDto.codigo },
    });

    if (exists) {
      throw new ConflictException(`El código ${createEstadoSolicitudDto.codigo} ya existe`);
    }

    const estadoSolicitud = this.estadoSolicitudRepository.create(createEstadoSolicitudDto);
    return await this.estadoSolicitudRepository.save(estadoSolicitud);
  }

  async findAll(): Promise<EstadoSolicitud[]> {
    return await this.estadoSolicitudRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActivos(): Promise<EstadoSolicitud[]> {
    return await this.estadoSolicitudRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<EstadoSolicitud> {
    const estadoSolicitud = await this.estadoSolicitudRepository.findOne({
      where: { id },
    });

    if (!estadoSolicitud) {
      throw new NotFoundException(`EstadoSolicitud con ID ${id} no encontrado`);
    }

    return estadoSolicitud;
  }

  async findByCodigo(codigo: string): Promise<EstadoSolicitud> {
    const estadoSolicitud = await this.estadoSolicitudRepository.findOne({
      where: { codigo },
    });

    if (!estadoSolicitud) {
      throw new NotFoundException(`EstadoSolicitud con código ${codigo} no encontrado`);
    }

    return estadoSolicitud;
  }

  async update(id: number, updateEstadoSolicitudDto: UpdateEstadoSolicitudDto): Promise<EstadoSolicitud> {
    const estadoSolicitud = await this.findOne(id);

    if (updateEstadoSolicitudDto.codigo && updateEstadoSolicitudDto.codigo !== estadoSolicitud.codigo) {
      const exists = await this.estadoSolicitudRepository.findOne({
        where: { codigo: updateEstadoSolicitudDto.codigo },
      });

      if (exists) {
        throw new ConflictException(`El código ${updateEstadoSolicitudDto.codigo} ya existe`);
      }
    }

    Object.assign(estadoSolicitud, updateEstadoSolicitudDto);
    return await this.estadoSolicitudRepository.save(estadoSolicitud);
  }

  async remove(id: number): Promise<void> {
    const estadoSolicitud = await this.findOne(id);
    await this.estadoSolicitudRepository.remove(estadoSolicitud);
  }
}
