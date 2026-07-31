import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoAccion } from './entities/tipo-accion.entity';
import { CreateTipoAccionDto } from './dto/create-tipo-accion.dto';
import { UpdateTipoAccionDto } from './dto/update-tipo-accion.dto';

@Injectable()
export class TipoAccionService {
  constructor(
    @InjectRepository(TipoAccion)
    private readonly repo: Repository<TipoAccion>,
  ) {}

  async create(dto: CreateTipoAccionDto): Promise<TipoAccion> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(activo?: boolean): Promise<TipoAccion[]> {
    const qb = this.repo.createQueryBuilder('tipo');

    if (activo !== undefined) {
      qb.andWhere('tipo.activo = :activo', { activo });
    }

    qb.orderBy('tipo.nombre', 'ASC');
    return qb.getMany();
  }

  async findOne(id: number): Promise<TipoAccion> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Tipo de acción ID ${id} no encontrado`);
    }
    return entity;
  }

  async update(id: number, dto: UpdateTipoAccionDto): Promise<TipoAccion> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }
}
