import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngresoCliente } from './entities/ingreso-cliente.entity';
import { CreateIngresoClienteDto } from './dto/create-ingreso-cliente.dto';
import { UpdateIngresoClienteDto } from './dto/update-ingreso-cliente.dto';

@Injectable()
export class IngresoClienteService {
  constructor(
    @InjectRepository(IngresoCliente)
    private readonly ingresoClienteRepository: Repository<IngresoCliente>,
  ) {}

  async create(createIngresoClienteDto: CreateIngresoClienteDto): Promise<IngresoCliente> {
    const ingreso = this.ingresoClienteRepository.create(createIngresoClienteDto);
    return await this.ingresoClienteRepository.save(ingreso);
  }

  async findAll(): Promise<IngresoCliente[]> {
    return await this.ingresoClienteRepository.find({
      relations: ['persona', 'tipoIngreso'],
      order: { id: 'DESC' },
    });
  }

  async findByPersona(personaId: number): Promise<IngresoCliente[]> {
    return await this.ingresoClienteRepository.find({
      where: { personaId },
      relations: ['tipoIngreso'],
      order: { tipoIngresoId: 'ASC' },
    });
  }

  async findOne(id: number): Promise<IngresoCliente> {
    const ingreso = await this.ingresoClienteRepository.findOne({
      where: { id },
      relations: ['persona', 'tipoIngreso'],
    });

    if (!ingreso) {
      throw new NotFoundException(`Ingreso con ID ${id} no encontrado`);
    }

    return ingreso;
  }

  async update(id: number, updateIngresoClienteDto: UpdateIngresoClienteDto): Promise<IngresoCliente> {
    const ingreso = await this.findOne(id);
    Object.assign(ingreso, updateIngresoClienteDto);
    return await this.ingresoClienteRepository.save(ingreso);
  }

  async remove(id: number): Promise<void> {
    const ingreso = await this.findOne(id);
    await this.ingresoClienteRepository.remove(ingreso);
  }

  async getTotalByPersona(personaId: number): Promise<number> {
    const result = await this.ingresoClienteRepository
      .createQueryBuilder('ingreso')
      .select('SUM(ingreso.monto)', 'total')
      .where('ingreso.personaId = :personaId', { personaId })
      .getRawOne();

    return result?.total ? parseFloat(result.total) : 0;
  }
}
