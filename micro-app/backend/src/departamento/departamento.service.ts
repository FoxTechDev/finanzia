import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departamento } from './entities/departamento.entity';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';

@Injectable()
export class DepartamentoService {
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
  ) {}

  async create(createDepartamentoDto: CreateDepartamentoDto): Promise<Departamento> {
    const departamento = this.departamentoRepository.create(createDepartamentoDto);
    return this.departamentoRepository.save(departamento);
  }

  async findAll(): Promise<Departamento[]> {
    return this.departamentoRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Departamento> {
    return this.departamentoRepository.findOneOrFail({ where: { id } });
  }
}
