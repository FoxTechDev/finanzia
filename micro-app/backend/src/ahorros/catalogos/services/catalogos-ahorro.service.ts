import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoCuentaAhorro } from '../entities/estado-cuenta-ahorro.entity';
import { TipoCapitalizacion } from '../entities/tipo-capitalizacion.entity';
import { NaturalezaMovimientoAhorro } from '../entities/naturaleza-movimiento-ahorro.entity';
import { TipoTransaccionAhorro } from '../entities/tipo-transaccion-ahorro.entity';
import { TransaccionTipoAhorro } from '../entities/transaccion-tipo-ahorro.entity';
import {
  CreateEstadoCuentaAhorroDto,
  UpdateEstadoCuentaAhorroDto,
  CreateTipoCapitalizacionDto,
  UpdateTipoCapitalizacionDto,
  CreateNaturalezaMovimientoDto,
  UpdateNaturalezaMovimientoDto,
  CreateTipoTransaccionAhorroDto,
  UpdateTipoTransaccionAhorroDto,
} from '../dto/catalogos-ahorro.dto';

@Injectable()
export class CatalogosAhorroService {
  constructor(
    @InjectRepository(EstadoCuentaAhorro)
    private readonly estadoRepo: Repository<EstadoCuentaAhorro>,
    @InjectRepository(TipoCapitalizacion)
    private readonly tipoCapRepo: Repository<TipoCapitalizacion>,
    @InjectRepository(NaturalezaMovimientoAhorro)
    private readonly naturalezaRepo: Repository<NaturalezaMovimientoAhorro>,
    @InjectRepository(TipoTransaccionAhorro)
    private readonly tipoTransRepo: Repository<TipoTransaccionAhorro>,
    @InjectRepository(TransaccionTipoAhorro)
    private readonly transaccionTipoRepo: Repository<TransaccionTipoAhorro>,
  ) {}

  // ==================== Estados ====================

  async findEstados(): Promise<EstadoCuentaAhorro[]> {
    return this.estadoRepo.find({ order: { nombre: 'ASC' } });
  }

  async findEstadoByCodigo(codigo: string): Promise<EstadoCuentaAhorro> {
    const entity = await this.estadoRepo.findOne({ where: { codigo } });
    if (!entity) {
      throw new NotFoundException(`Estado de cuenta '${codigo}' no encontrado`);
    }
    return entity;
  }

  async createEstado(
    dto: CreateEstadoCuentaAhorroDto,
  ): Promise<EstadoCuentaAhorro> {
    const exists = await this.estadoRepo.findOne({
      where: { codigo: dto.codigo },
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe un estado con código '${dto.codigo}'`,
      );
    }
    const entity = this.estadoRepo.create(dto);
    return this.estadoRepo.save(entity);
  }

  async updateEstado(
    id: number,
    dto: UpdateEstadoCuentaAhorroDto,
  ): Promise<EstadoCuentaAhorro> {
    const entity = await this.estadoRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Estado con id ${id} no encontrado`);
    }
    Object.assign(entity, dto);
    return this.estadoRepo.save(entity);
  }

  async deleteEstado(id: number): Promise<void> {
    const result = await this.estadoRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Estado con id ${id} no encontrado`);
    }
  }

  // ==================== Tipos Capitalización ====================

  async findTiposCapitalizacion(): Promise<TipoCapitalizacion[]> {
    return this.tipoCapRepo.find({ order: { nombre: 'ASC' } });
  }

  async findTipoCapitalizacionByCodigo(
    codigo: string,
  ): Promise<TipoCapitalizacion> {
    const entity = await this.tipoCapRepo.findOne({ where: { codigo } });
    if (!entity) {
      throw new NotFoundException(
        `Tipo de capitalización '${codigo}' no encontrado`,
      );
    }
    return entity;
  }

  async createTipoCapitalizacion(
    dto: CreateTipoCapitalizacionDto,
  ): Promise<TipoCapitalizacion> {
    const exists = await this.tipoCapRepo.findOne({
      where: { codigo: dto.codigo },
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe un tipo de capitalización con código '${dto.codigo}'`,
      );
    }
    const entity = this.tipoCapRepo.create(dto);
    return this.tipoCapRepo.save(entity);
  }

  async updateTipoCapitalizacion(
    id: number,
    dto: UpdateTipoCapitalizacionDto,
  ): Promise<TipoCapitalizacion> {
    const entity = await this.tipoCapRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Tipo de capitalización con id ${id} no encontrado`,
      );
    }
    Object.assign(entity, dto);
    return this.tipoCapRepo.save(entity);
  }

  async deleteTipoCapitalizacion(id: number): Promise<void> {
    const result = await this.tipoCapRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Tipo de capitalización con id ${id} no encontrado`,
      );
    }
  }

  // ==================== Naturalezas ====================

  async findNaturalezas(): Promise<NaturalezaMovimientoAhorro[]> {
    return this.naturalezaRepo.find({ order: { nombre: 'ASC' } });
  }

  async findNaturalezaByCodigo(
    codigo: string,
  ): Promise<NaturalezaMovimientoAhorro> {
    const entity = await this.naturalezaRepo.findOne({ where: { codigo } });
    if (!entity) {
      throw new NotFoundException(`Naturaleza '${codigo}' no encontrada`);
    }
    return entity;
  }

  async createNaturaleza(
    dto: CreateNaturalezaMovimientoDto,
  ): Promise<NaturalezaMovimientoAhorro> {
    const exists = await this.naturalezaRepo.findOne({
      where: { codigo: dto.codigo },
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe una naturaleza con código '${dto.codigo}'`,
      );
    }
    const entity = this.naturalezaRepo.create(dto);
    return this.naturalezaRepo.save(entity);
  }

  async updateNaturaleza(
    id: number,
    dto: UpdateNaturalezaMovimientoDto,
  ): Promise<NaturalezaMovimientoAhorro> {
    const entity = await this.naturalezaRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Naturaleza con id ${id} no encontrada`);
    }
    Object.assign(entity, dto);
    return this.naturalezaRepo.save(entity);
  }

  async deleteNaturaleza(id: number): Promise<void> {
    const result = await this.naturalezaRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Naturaleza con id ${id} no encontrada`);
    }
  }

  // ==================== Tipos Transacción ====================

  async findTiposTransaccion(): Promise<TipoTransaccionAhorro[]> {
    return this.tipoTransRepo.find({
      relations: ['naturaleza'],
      order: { nombre: 'ASC' },
    });
  }

  async findTipoTransaccionById(
    id: number,
  ): Promise<TipoTransaccionAhorro> {
    const entity = await this.tipoTransRepo.findOne({
      where: { id },
      relations: ['naturaleza'],
    });
    if (!entity) {
      throw new NotFoundException(
        `Tipo de transacción con id ${id} no encontrado`,
      );
    }
    return entity;
  }

  async findTipoTransaccionByCodigo(
    codigo: string,
  ): Promise<TipoTransaccionAhorro> {
    const entity = await this.tipoTransRepo.findOne({
      where: { codigo },
      relations: ['naturaleza'],
    });
    if (!entity) {
      throw new NotFoundException(
        `Tipo de transacción '${codigo}' no encontrado`,
      );
    }
    return entity;
  }

  async createTipoTransaccion(
    dto: CreateTipoTransaccionAhorroDto,
  ): Promise<TipoTransaccionAhorro> {
    const exists = await this.tipoTransRepo.findOne({
      where: { codigo: dto.codigo },
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe un tipo de transacción con código '${dto.codigo}'`,
      );
    }
    const entity = this.tipoTransRepo.create(dto);
    const saved = await this.tipoTransRepo.save(entity);
    return this.tipoTransRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ['naturaleza'],
    });
  }

  async updateTipoTransaccion(
    id: number,
    dto: UpdateTipoTransaccionAhorroDto,
  ): Promise<TipoTransaccionAhorro> {
    const entity = await this.tipoTransRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Tipo de transacción con id ${id} no encontrado`,
      );
    }
    Object.assign(entity, dto);
    await this.tipoTransRepo.save(entity);
    return this.tipoTransRepo.findOneOrFail({
      where: { id },
      relations: ['naturaleza'],
    });
  }

  async deleteTipoTransaccion(id: number): Promise<void> {
    const result = await this.tipoTransRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Tipo de transacción con id ${id} no encontrado`,
      );
    }
  }

  // ==================== Transacciones por Tipo Ahorro ====================

  async findTransaccionesByTipoAhorro(
    tipoAhorroId: number,
  ): Promise<TipoTransaccionAhorro[]> {
    const asignaciones = await this.transaccionTipoRepo.find({
      where: { tipoAhorroId },
      relations: ['tipoTransaccion', 'tipoTransaccion.naturaleza'],
    });
    return asignaciones.map((a) => a.tipoTransaccion);
  }

  async asignarTransaccion(
    tipoAhorroId: number,
    tipoTransaccionId: number,
  ): Promise<TransaccionTipoAhorro> {
    const exists = await this.transaccionTipoRepo.findOne({
      where: { tipoAhorroId, tipoTransaccionId },
    });
    if (exists) {
      throw new ConflictException('Esta transacción ya está asignada a este tipo de ahorro');
    }
    const entity = this.transaccionTipoRepo.create({
      tipoAhorroId,
      tipoTransaccionId,
    });
    return this.transaccionTipoRepo.save(entity);
  }

  async desasignarTransaccion(
    tipoAhorroId: number,
    tipoTransaccionId: number,
  ): Promise<void> {
    const result = await this.transaccionTipoRepo.delete({
      tipoAhorroId,
      tipoTransaccionId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Asignación no encontrada');
    }
  }

  async getAsignaciones(
    tipoAhorroId: number,
  ): Promise<TransaccionTipoAhorro[]> {
    return this.transaccionTipoRepo.find({
      where: { tipoAhorroId },
      relations: ['tipoTransaccion', 'tipoTransaccion.naturaleza'],
    });
  }
}
