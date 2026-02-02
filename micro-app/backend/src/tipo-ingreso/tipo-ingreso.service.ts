import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoIngreso } from './entities/tipo-ingreso.entity';
import { CreateTipoIngresoDto } from './dto/create-tipo-ingreso.dto';
import { UpdateTipoIngresoDto } from './dto/update-tipo-ingreso.dto';

@Injectable()
export class TipoIngresoService {
  constructor(
    @InjectRepository(TipoIngreso)
    private readonly tipoIngresoRepository: Repository<TipoIngreso>,
  ) {}

  async create(createTipoIngresoDto: CreateTipoIngresoDto): Promise<TipoIngreso> {
    // Check if a tipo ingreso with the same name already exists
    const existing = await this.tipoIngresoRepository.findOne({
      where: { nombre: createTipoIngresoDto.nombre },
    });

    if (existing) {
      throw new ConflictException(`El tipo de ingreso '${createTipoIngresoDto.nombre}' ya existe`);
    }

    const tipoIngreso = this.tipoIngresoRepository.create(createTipoIngresoDto);
    return await this.tipoIngresoRepository.save(tipoIngreso);
  }

  async findAll(): Promise<TipoIngreso[]> {
    return await this.tipoIngresoRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findActive(): Promise<TipoIngreso[]> {
    return await this.tipoIngresoRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TipoIngreso> {
    const tipoIngreso = await this.tipoIngresoRepository.findOne({
      where: { id },
    });

    if (!tipoIngreso) {
      throw new NotFoundException(`Tipo de ingreso con ID ${id} no encontrado`);
    }

    return tipoIngreso;
  }

  async update(id: number, updateTipoIngresoDto: UpdateTipoIngresoDto): Promise<TipoIngreso> {
    const tipoIngreso = await this.findOne(id);

    // Check if updating to an existing name
    if (updateTipoIngresoDto.nombre && updateTipoIngresoDto.nombre !== tipoIngreso.nombre) {
      const existing = await this.tipoIngresoRepository.findOne({
        where: { nombre: updateTipoIngresoDto.nombre },
      });

      if (existing) {
        throw new ConflictException(`El tipo de ingreso '${updateTipoIngresoDto.nombre}' ya existe`);
      }
    }

    Object.assign(tipoIngreso, updateTipoIngresoDto);
    return await this.tipoIngresoRepository.save(tipoIngreso);
  }

  async remove(id: number): Promise<void> {
    const tipoIngreso = await this.findOne(id);
    await this.tipoIngresoRepository.remove(tipoIngreso);
  }
}
