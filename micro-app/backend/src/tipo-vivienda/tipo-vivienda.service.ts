import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoVivienda } from './entities/tipo-vivienda.entity';
import { CreateTipoViviendaDto } from './dto/create-tipo-vivienda.dto';
import { UpdateTipoViviendaDto } from './dto/update-tipo-vivienda.dto';

@Injectable()
export class TipoViviendaService {
  constructor(
    @InjectRepository(TipoVivienda)
    private readonly tipoViviendaRepository: Repository<TipoVivienda>,
  ) {}

  async create(createTipoViviendaDto: CreateTipoViviendaDto): Promise<TipoVivienda> {
    // Check if a tipo vivienda with the same codigo or nombre already exists
    const existingCodigo = await this.tipoViviendaRepository.findOne({
      where: { codigo: createTipoViviendaDto.codigo },
    });

    if (existingCodigo) {
      throw new ConflictException(`El tipo de vivienda con código '${createTipoViviendaDto.codigo}' ya existe`);
    }

    const existingNombre = await this.tipoViviendaRepository.findOne({
      where: { nombre: createTipoViviendaDto.nombre },
    });

    if (existingNombre) {
      throw new ConflictException(`El tipo de vivienda '${createTipoViviendaDto.nombre}' ya existe`);
    }

    const tipoVivienda = this.tipoViviendaRepository.create(createTipoViviendaDto);
    return await this.tipoViviendaRepository.save(tipoVivienda);
  }

  async findAll(): Promise<TipoVivienda[]> {
    return await this.tipoViviendaRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActive(): Promise<TipoVivienda[]> {
    return await this.tipoViviendaRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TipoVivienda> {
    const tipoVivienda = await this.tipoViviendaRepository.findOne({
      where: { id },
    });

    if (!tipoVivienda) {
      throw new NotFoundException(`Tipo de vivienda con ID ${id} no encontrado`);
    }

    return tipoVivienda;
  }

  async update(id: number, updateTipoViviendaDto: UpdateTipoViviendaDto): Promise<TipoVivienda> {
    const tipoVivienda = await this.findOne(id);

    // Check if updating to an existing codigo
    if (updateTipoViviendaDto.codigo && updateTipoViviendaDto.codigo !== tipoVivienda.codigo) {
      const existingCodigo = await this.tipoViviendaRepository.findOne({
        where: { codigo: updateTipoViviendaDto.codigo },
      });

      if (existingCodigo) {
        throw new ConflictException(`El tipo de vivienda con código '${updateTipoViviendaDto.codigo}' ya existe`);
      }
    }

    // Check if updating to an existing nombre
    if (updateTipoViviendaDto.nombre && updateTipoViviendaDto.nombre !== tipoVivienda.nombre) {
      const existingNombre = await this.tipoViviendaRepository.findOne({
        where: { nombre: updateTipoViviendaDto.nombre },
      });

      if (existingNombre) {
        throw new ConflictException(`El tipo de vivienda '${updateTipoViviendaDto.nombre}' ya existe`);
      }
    }

    Object.assign(tipoVivienda, updateTipoViviendaDto);
    return await this.tipoViviendaRepository.save(tipoVivienda);
  }

  async toggleActivo(id: number, activo: boolean): Promise<TipoVivienda> {
    const tipoVivienda = await this.findOne(id);
    tipoVivienda.activo = activo;
    return await this.tipoViviendaRepository.save(tipoVivienda);
  }

  async remove(id: number): Promise<void> {
    const tipoVivienda = await this.findOne(id);
    await this.tipoViviendaRepository.remove(tipoVivienda);
  }
}
