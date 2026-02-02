import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoGasto } from './entities/tipo-gasto.entity';
import { CreateTipoGastoDto } from './dto/create-tipo-gasto.dto';
import { UpdateTipoGastoDto } from './dto/update-tipo-gasto.dto';

@Injectable()
export class TipoGastoService {
  constructor(
    @InjectRepository(TipoGasto)
    private readonly tipoGastoRepository: Repository<TipoGasto>,
  ) {}

  async create(createTipoGastoDto: CreateTipoGastoDto): Promise<TipoGasto> {
    // Check if a tipo gasto with the same name already exists
    const existing = await this.tipoGastoRepository.findOne({
      where: { nombre: createTipoGastoDto.nombre },
    });

    if (existing) {
      throw new ConflictException(`El tipo de gasto '${createTipoGastoDto.nombre}' ya existe`);
    }

    const tipoGasto = this.tipoGastoRepository.create(createTipoGastoDto);
    return await this.tipoGastoRepository.save(tipoGasto);
  }

  async findAll(): Promise<TipoGasto[]> {
    return await this.tipoGastoRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findActive(): Promise<TipoGasto[]> {
    return await this.tipoGastoRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TipoGasto> {
    const tipoGasto = await this.tipoGastoRepository.findOne({
      where: { id },
    });

    if (!tipoGasto) {
      throw new NotFoundException(`Tipo de gasto con ID ${id} no encontrado`);
    }

    return tipoGasto;
  }

  async update(id: number, updateTipoGastoDto: UpdateTipoGastoDto): Promise<TipoGasto> {
    const tipoGasto = await this.findOne(id);

    // Check if updating to an existing name
    if (updateTipoGastoDto.nombre && updateTipoGastoDto.nombre !== tipoGasto.nombre) {
      const existing = await this.tipoGastoRepository.findOne({
        where: { nombre: updateTipoGastoDto.nombre },
      });

      if (existing) {
        throw new ConflictException(`El tipo de gasto '${updateTipoGastoDto.nombre}' ya existe`);
      }
    }

    Object.assign(tipoGasto, updateTipoGastoDto);
    return await this.tipoGastoRepository.save(tipoGasto);
  }

  async remove(id: number): Promise<void> {
    const tipoGasto = await this.findOne(id);
    await this.tipoGastoRepository.remove(tipoGasto);
  }
}
