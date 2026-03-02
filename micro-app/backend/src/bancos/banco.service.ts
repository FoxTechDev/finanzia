import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banco } from './banco.entity';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';

@Injectable()
export class BancoService {
  constructor(
    @InjectRepository(Banco)
    private readonly bancoRepo: Repository<Banco>,
  ) {}

  async findAll(activo?: boolean): Promise<Banco[]> {
    const where: Partial<Banco> = {};
    if (activo !== undefined) {
      where.activo = activo;
    }
    return this.bancoRepo.find({
      where,
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Banco> {
    const banco = await this.bancoRepo.findOne({ where: { id } });
    if (!banco) {
      throw new NotFoundException(`Banco con ID ${id} no encontrado`);
    }
    return banco;
  }

  async create(dto: CreateBancoDto): Promise<Banco> {
    const codigo = await this.generarCodigo();
    const banco = this.bancoRepo.create({
      codigo,
      nombre: dto.nombre,
      activo: dto.activo !== undefined ? dto.activo : true,
    });
    return this.bancoRepo.save(banco);
  }

  private async generarCodigo(): Promise<string> {
    const prefix = 'BAN';
    const result = await this.bancoRepo
      .createQueryBuilder('b')
      .select('MAX(b.codigo)', 'max')
      .where('b.codigo LIKE :prefix', { prefix: `${prefix}%` })
      .getRawOne();

    let seq = 1;
    if (result?.max) {
      const lastSeq = parseInt(result.max.replace(prefix, ''), 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }
    return `${prefix}${seq.toString().padStart(3, '0')}`;
  }

  async update(id: number, dto: UpdateBancoDto): Promise<Banco> {
    const banco = await this.findOne(id);

    if (dto.codigo && dto.codigo !== banco.codigo) {
      const existing = await this.bancoRepo.findOne({
        where: { codigo: dto.codigo },
      });
      if (existing) {
        throw new BadRequestException(
          `Ya existe un banco con el código "${dto.codigo}"`,
        );
      }
    }

    Object.assign(banco, {
      ...(dto.codigo !== undefined && { codigo: dto.codigo.toUpperCase() }),
      ...(dto.nombre !== undefined && { nombre: dto.nombre }),
      ...(dto.activo !== undefined && { activo: dto.activo }),
    });

    return this.bancoRepo.save(banco);
  }
}
