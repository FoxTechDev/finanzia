import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoCalculo } from './entities/tipo-calculo.entity';
import { CreateTipoCalculoDto } from './dto/create-tipo-calculo.dto';
import { UpdateTipoCalculoDto } from './dto/update-tipo-calculo.dto';

@Injectable()
export class TipoCalculoService {
  constructor(
    @InjectRepository(TipoCalculo)
    private readonly tipoCalculoRepository: Repository<TipoCalculo>,
  ) {}

  async create(createTipoCalculoDto: CreateTipoCalculoDto): Promise<TipoCalculo> {
    const exists = await this.tipoCalculoRepository.findOne({
      where: { codigo: createTipoCalculoDto.codigo },
    });

    if (exists) {
      throw new ConflictException(`El código ${createTipoCalculoDto.codigo} ya existe`);
    }

    const tipoCalculo = this.tipoCalculoRepository.create(createTipoCalculoDto);
    return await this.tipoCalculoRepository.save(tipoCalculo);
  }

  async findAll(): Promise<TipoCalculo[]> {
    return await this.tipoCalculoRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActivos(): Promise<TipoCalculo[]> {
    return await this.tipoCalculoRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TipoCalculo> {
    const tipoCalculo = await this.tipoCalculoRepository.findOne({
      where: { id },
    });

    if (!tipoCalculo) {
      throw new NotFoundException(`TipoCalculo con ID ${id} no encontrado`);
    }

    return tipoCalculo;
  }

  async findByCodigo(codigo: string): Promise<TipoCalculo> {
    const tipoCalculo = await this.tipoCalculoRepository.findOne({
      where: { codigo },
    });

    if (!tipoCalculo) {
      throw new NotFoundException(`TipoCalculo con código ${codigo} no encontrado`);
    }

    return tipoCalculo;
  }

  async update(id: number, updateTipoCalculoDto: UpdateTipoCalculoDto): Promise<TipoCalculo> {
    const tipoCalculo = await this.findOne(id);

    if (updateTipoCalculoDto.codigo && updateTipoCalculoDto.codigo !== tipoCalculo.codigo) {
      const exists = await this.tipoCalculoRepository.findOne({
        where: { codigo: updateTipoCalculoDto.codigo },
      });

      if (exists) {
        throw new ConflictException(`El código ${updateTipoCalculoDto.codigo} ya existe`);
      }
    }

    Object.assign(tipoCalculo, updateTipoCalculoDto);
    return await this.tipoCalculoRepository.save(tipoCalculo);
  }

  async remove(id: number): Promise<void> {
    const tipoCalculo = await this.findOne(id);
    await this.tipoCalculoRepository.remove(tipoCalculo);
  }
}
