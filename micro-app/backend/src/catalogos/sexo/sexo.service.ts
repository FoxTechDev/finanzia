import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sexo } from './entities/sexo.entity';
import { CreateSexoDto } from './dto/create-sexo.dto';
import { UpdateSexoDto } from './dto/update-sexo.dto';

@Injectable()
export class SexoService {
  constructor(
    @InjectRepository(Sexo)
    private readonly sexoRepository: Repository<Sexo>,
  ) {}

  async create(createSexoDto: CreateSexoDto): Promise<Sexo> {
    const exists = await this.sexoRepository.findOne({
      where: { codigo: createSexoDto.codigo },
    });

    if (exists) {
      throw new ConflictException(`El código ${createSexoDto.codigo} ya existe`);
    }

    const sexo = this.sexoRepository.create(createSexoDto);
    return await this.sexoRepository.save(sexo);
  }

  async findAll(): Promise<Sexo[]> {
    return await this.sexoRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findActivos(): Promise<Sexo[]> {
    return await this.sexoRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Sexo> {
    const sexo = await this.sexoRepository.findOne({
      where: { id },
    });

    if (!sexo) {
      throw new NotFoundException(`Sexo con ID ${id} no encontrado`);
    }

    return sexo;
  }

  async findByCodigo(codigo: string): Promise<Sexo> {
    const sexo = await this.sexoRepository.findOne({
      where: { codigo },
    });

    if (!sexo) {
      throw new NotFoundException(`Sexo con código ${codigo} no encontrado`);
    }

    return sexo;
  }

  async update(id: number, updateSexoDto: UpdateSexoDto): Promise<Sexo> {
    const sexo = await this.findOne(id);

    if (updateSexoDto.codigo && updateSexoDto.codigo !== sexo.codigo) {
      const exists = await this.sexoRepository.findOne({
        where: { codigo: updateSexoDto.codigo },
      });

      if (exists) {
        throw new ConflictException(`El código ${updateSexoDto.codigo} ya existe`);
      }
    }

    Object.assign(sexo, updateSexoDto);
    return await this.sexoRepository.save(sexo);
  }

  async remove(id: number): Promise<void> {
    const sexo = await this.findOne(id);
    await this.sexoRepository.remove(sexo);
  }
}
