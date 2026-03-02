import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoAhorro } from './entities/tipo-ahorro.entity';
import { CreateTipoAhorroDto } from './dto/create-tipo-ahorro.dto';
import { UpdateTipoAhorroDto } from './dto/update-tipo-ahorro.dto';

@Injectable()
export class TipoAhorroService {
  constructor(
    @InjectRepository(TipoAhorro)
    private readonly repo: Repository<TipoAhorro>,
  ) {}

  async create(dto: CreateTipoAhorroDto): Promise<TipoAhorro> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(activo?: boolean, lineaCodigo?: string): Promise<TipoAhorro[]> {
    const qb = this.repo
      .createQueryBuilder('tipo')
      .leftJoinAndSelect('tipo.lineaAhorro', 'lineaAhorro');

    if (activo !== undefined) {
      qb.andWhere('tipo.activo = :activo', { activo });
    }

    if (lineaCodigo) {
      qb.andWhere('lineaAhorro.codigo = :lineaCodigo', { lineaCodigo });
    }

    qb.orderBy('tipo.nombre', 'ASC');
    return qb.getMany();
  }

  async findOne(id: number): Promise<TipoAhorro> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['lineaAhorro'],
    });
    if (!entity) {
      throw new NotFoundException(`Tipo de ahorro ID ${id} no encontrado`);
    }
    return entity;
  }

  async update(id: number, dto: UpdateTipoAhorroDto): Promise<TipoAhorro> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }
}
