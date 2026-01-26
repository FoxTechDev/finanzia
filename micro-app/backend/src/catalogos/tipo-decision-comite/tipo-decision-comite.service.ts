import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoDecisionComite } from './entities/tipo-decision-comite.entity';
import { CreateTipoDecisionComiteDto } from './dto/create-tipo-decision-comite.dto';
import { UpdateTipoDecisionComiteDto } from './dto/update-tipo-decision-comite.dto';

@Injectable()
export class TipoDecisionComiteService {
  constructor(
    @InjectRepository(TipoDecisionComite)
    private readonly tipoDecisionComiteRepository: Repository<TipoDecisionComite>,
  ) {}

  async create(createTipoDecisionComiteDto: CreateTipoDecisionComiteDto): Promise<TipoDecisionComite> {
    const exists = await this.tipoDecisionComiteRepository.findOne({
      where: { codigo: createTipoDecisionComiteDto.codigo },
    });

    if (exists) {
      throw new ConflictException(`El código ${createTipoDecisionComiteDto.codigo} ya existe`);
    }

    const tipoDecisionComite = this.tipoDecisionComiteRepository.create(createTipoDecisionComiteDto);
    return await this.tipoDecisionComiteRepository.save(tipoDecisionComite);
  }

  async findAll(): Promise<TipoDecisionComite[]> {
    return await this.tipoDecisionComiteRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActivos(): Promise<TipoDecisionComite[]> {
    return await this.tipoDecisionComiteRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TipoDecisionComite> {
    const tipoDecisionComite = await this.tipoDecisionComiteRepository.findOne({
      where: { id },
    });

    if (!tipoDecisionComite) {
      throw new NotFoundException(`TipoDecisionComite con ID ${id} no encontrado`);
    }

    return tipoDecisionComite;
  }

  async findByCodigo(codigo: string): Promise<TipoDecisionComite> {
    const tipoDecisionComite = await this.tipoDecisionComiteRepository.findOne({
      where: { codigo },
    });

    if (!tipoDecisionComite) {
      throw new NotFoundException(`TipoDecisionComite con código ${codigo} no encontrado`);
    }

    return tipoDecisionComite;
  }

  async update(id: number, updateTipoDecisionComiteDto: UpdateTipoDecisionComiteDto): Promise<TipoDecisionComite> {
    const tipoDecisionComite = await this.findOne(id);

    if (updateTipoDecisionComiteDto.codigo && updateTipoDecisionComiteDto.codigo !== tipoDecisionComite.codigo) {
      const exists = await this.tipoDecisionComiteRepository.findOne({
        where: { codigo: updateTipoDecisionComiteDto.codigo },
      });

      if (exists) {
        throw new ConflictException(`El código ${updateTipoDecisionComiteDto.codigo} ya existe`);
      }
    }

    Object.assign(tipoDecisionComite, updateTipoDecisionComiteDto);
    return await this.tipoDecisionComiteRepository.save(tipoDecisionComite);
  }

  async remove(id: number): Promise<void> {
    const tipoDecisionComite = await this.findOne(id);
    await this.tipoDecisionComiteRepository.remove(tipoDecisionComite);
  }
}
