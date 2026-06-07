import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormaPago } from './entities/forma-pago.entity';
import { CreateFormaPagoDto } from './dto/create-forma-pago.dto';
import { UpdateFormaPagoDto } from './dto/update-forma-pago.dto';

@Injectable()
export class FormaPagoService {
  constructor(
    @InjectRepository(FormaPago)
    private readonly repo: Repository<FormaPago>,
  ) {}

  async create(dto: CreateFormaPagoDto): Promise<FormaPago> {
    return await this.repo.save(this.repo.create(dto));
  }

  async findAll(): Promise<FormaPago[]> {
    return await this.repo.find({ order: { formaPago: 'ASC' } });
  }

  async findOne(id: number): Promise<FormaPago> {
    const item = await this.repo.findOne({ where: { idFormaPago: id } });
    if (!item) throw new NotFoundException(`Forma de pago ${id} no encontrada`);
    return item;
  }

  async update(id: number, dto: UpdateFormaPagoDto): Promise<FormaPago> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return await this.repo.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.repo.remove(item);
  }
}
