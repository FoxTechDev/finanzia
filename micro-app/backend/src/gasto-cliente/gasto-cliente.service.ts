import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GastoCliente } from './entities/gasto-cliente.entity';
import { CreateGastoClienteDto } from './dto/create-gasto-cliente.dto';
import { UpdateGastoClienteDto } from './dto/update-gasto-cliente.dto';

@Injectable()
export class GastoClienteService {
  constructor(
    @InjectRepository(GastoCliente)
    private readonly gastoClienteRepository: Repository<GastoCliente>,
  ) {}

  async create(createGastoClienteDto: CreateGastoClienteDto): Promise<GastoCliente> {
    const gasto = this.gastoClienteRepository.create(createGastoClienteDto);
    return await this.gastoClienteRepository.save(gasto);
  }

  async findAll(): Promise<GastoCliente[]> {
    return await this.gastoClienteRepository.find({
      relations: ['persona', 'tipoGasto'],
      order: { id: 'DESC' },
    });
  }

  async findByPersona(personaId: number): Promise<GastoCliente[]> {
    return await this.gastoClienteRepository.find({
      where: { personaId },
      relations: ['tipoGasto'],
      order: { tipoGastoId: 'ASC' },
    });
  }

  async findOne(id: number): Promise<GastoCliente> {
    const gasto = await this.gastoClienteRepository.findOne({
      where: { id },
      relations: ['persona', 'tipoGasto'],
    });

    if (!gasto) {
      throw new NotFoundException(`Gasto con ID ${id} no encontrado`);
    }

    return gasto;
  }

  async update(id: number, updateGastoClienteDto: UpdateGastoClienteDto): Promise<GastoCliente> {
    const gasto = await this.findOne(id);
    Object.assign(gasto, updateGastoClienteDto);
    return await this.gastoClienteRepository.save(gasto);
  }

  async remove(id: number): Promise<void> {
    const gasto = await this.findOne(id);
    await this.gastoClienteRepository.remove(gasto);
  }

  async getTotalByPersona(personaId: number): Promise<number> {
    const result = await this.gastoClienteRepository
      .createQueryBuilder('gasto')
      .select('SUM(gasto.monto)', 'total')
      .where('gasto.personaId = :personaId', { personaId })
      .getRawOne();

    return result?.total ? parseFloat(result.total) : 0;
  }
}
