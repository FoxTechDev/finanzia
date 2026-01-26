import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoCuota } from './entities/estado-cuota.entity';
import { CreateEstadoCuotaDto } from './dto/create-estado-cuota.dto';
import { UpdateEstadoCuotaDto } from './dto/update-estado-cuota.dto';

@Injectable()
export class EstadoCuotaService {
  constructor(
    @InjectRepository(EstadoCuota)
    private readonly estadoCuotaRepository: Repository<EstadoCuota>,
  ) {}

  async create(createEstadoCuotaDto: CreateEstadoCuotaDto): Promise<EstadoCuota> {
    const exists = await this.estadoCuotaRepository.findOne({
      where: { codigo: createEstadoCuotaDto.codigo },
    });

    if (exists) {
      throw new ConflictException(`El código ${createEstadoCuotaDto.codigo} ya existe`);
    }

    const estadoCuota = this.estadoCuotaRepository.create(createEstadoCuotaDto);
    return await this.estadoCuotaRepository.save(estadoCuota);
  }

  async findAll(): Promise<EstadoCuota[]> {
    return await this.estadoCuotaRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActivos(): Promise<EstadoCuota[]> {
    return await this.estadoCuotaRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<EstadoCuota> {
    const estadoCuota = await this.estadoCuotaRepository.findOne({
      where: { id },
    });

    if (!estadoCuota) {
      throw new NotFoundException(`EstadoCuota con ID ${id} no encontrado`);
    }

    return estadoCuota;
  }

  async findByCodigo(codigo: string): Promise<EstadoCuota> {
    const estadoCuota = await this.estadoCuotaRepository.findOne({
      where: { codigo },
    });

    if (!estadoCuota) {
      throw new NotFoundException(`EstadoCuota con código ${codigo} no encontrado`);
    }

    return estadoCuota;
  }

  async update(id: number, updateEstadoCuotaDto: UpdateEstadoCuotaDto): Promise<EstadoCuota> {
    const estadoCuota = await this.findOne(id);

    if (updateEstadoCuotaDto.codigo && updateEstadoCuotaDto.codigo !== estadoCuota.codigo) {
      const exists = await this.estadoCuotaRepository.findOne({
        where: { codigo: updateEstadoCuotaDto.codigo },
      });

      if (exists) {
        throw new ConflictException(`El código ${updateEstadoCuotaDto.codigo} ya existe`);
      }
    }

    Object.assign(estadoCuota, updateEstadoCuotaDto);
    return await this.estadoCuotaRepository.save(estadoCuota);
  }

  async remove(id: number): Promise<void> {
    const estadoCuota = await this.findOne(id);
    await this.estadoCuotaRepository.remove(estadoCuota);
  }
}
