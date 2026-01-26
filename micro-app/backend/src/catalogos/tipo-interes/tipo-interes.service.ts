import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoInteres } from './entities/tipo-interes.entity';
import { CreateTipoInteresDto } from './dto/create-tipo-interes.dto';
import { UpdateTipoInteresDto } from './dto/update-tipo-interes.dto';

@Injectable()
export class TipoInteresService {
  constructor(
    @InjectRepository(TipoInteres)
    private readonly tipoInteresRepository: Repository<TipoInteres>,
  ) {}

  async create(createTipoInteresDto: CreateTipoInteresDto): Promise<TipoInteres> {
    const exists = await this.tipoInteresRepository.findOne({
      where: { codigo: createTipoInteresDto.codigo },
    });

    if (exists) {
      throw new ConflictException(`El código ${createTipoInteresDto.codigo} ya existe`);
    }

    const tipoInteres = this.tipoInteresRepository.create(createTipoInteresDto);
    return await this.tipoInteresRepository.save(tipoInteres);
  }

  async findAll(): Promise<TipoInteres[]> {
    return await this.tipoInteresRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActivos(): Promise<TipoInteres[]> {
    return await this.tipoInteresRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TipoInteres> {
    const tipoInteres = await this.tipoInteresRepository.findOne({
      where: { id },
    });

    if (!tipoInteres) {
      throw new NotFoundException(`TipoInteres con ID ${id} no encontrado`);
    }

    return tipoInteres;
  }

  async findByCodigo(codigo: string): Promise<TipoInteres> {
    const tipoInteres = await this.tipoInteresRepository.findOne({
      where: { codigo },
    });

    if (!tipoInteres) {
      throw new NotFoundException(`TipoInteres con código ${codigo} no encontrado`);
    }

    return tipoInteres;
  }

  async update(id: number, updateTipoInteresDto: UpdateTipoInteresDto): Promise<TipoInteres> {
    const tipoInteres = await this.findOne(id);

    if (updateTipoInteresDto.codigo && updateTipoInteresDto.codigo !== tipoInteres.codigo) {
      const exists = await this.tipoInteresRepository.findOne({
        where: { codigo: updateTipoInteresDto.codigo },
      });

      if (exists) {
        throw new ConflictException(`El código ${updateTipoInteresDto.codigo} ya existe`);
      }
    }

    Object.assign(tipoInteres, updateTipoInteresDto);
    return await this.tipoInteresRepository.save(tipoInteres);
  }

  async remove(id: number): Promise<void> {
    const tipoInteres = await this.findOne(id);
    await this.tipoInteresRepository.remove(tipoInteres);
  }
}
