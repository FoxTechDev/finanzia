import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipio } from './entities/municipio.entity';
import { CreateMunicipioDto } from './dto/create-municipio.dto';

@Injectable()
export class MunicipioService {
  constructor(
    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,
  ) {}

  async create(createMunicipioDto: CreateMunicipioDto): Promise<Municipio> {
    const municipio = this.municipioRepository.create(createMunicipioDto);
    return this.municipioRepository.save(municipio);
  }

  async findAll(): Promise<Municipio[]> {
    return this.municipioRepository.find({
      relations: ['departamento'],
      order: { nombre: 'ASC' },
    });
  }

  async findByDepartamento(departamentoId: number): Promise<Municipio[]> {
    return this.municipioRepository.find({
      where: { departamentoId },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Municipio> {
    return this.municipioRepository.findOneOrFail({
      where: { id },
      relations: ['departamento'],
    });
  }
}
