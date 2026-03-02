import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LineaAhorro } from './entities/linea-ahorro.entity';
import { CreateLineaAhorroDto } from './dto/create-linea-ahorro.dto';
import { UpdateLineaAhorroDto } from './dto/update-linea-ahorro.dto';

@Injectable()
export class LineaAhorroService {
  constructor(
    @InjectRepository(LineaAhorro)
    private readonly repo: Repository<LineaAhorro>,
  ) {}

  async create(dto: CreateLineaAhorroDto): Promise<LineaAhorro> {
    const existing = await this.repo.findOne({
      where: { codigo: dto.codigo },
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe una línea de ahorro con código ${dto.codigo}`,
      );
    }
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(activo?: boolean): Promise<LineaAhorro[]> {
    const where: any = {};
    if (activo !== undefined) where.activo = activo;
    return this.repo.find({ where, order: { nombre: 'ASC' } });
  }

  async findOne(id: number): Promise<LineaAhorro> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['tiposAhorro'],
    });
    if (!entity) {
      throw new NotFoundException(`Línea de ahorro ID ${id} no encontrada`);
    }
    return entity;
  }

  async update(id: number, dto: UpdateLineaAhorroDto): Promise<LineaAhorro> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }
}
