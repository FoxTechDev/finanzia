import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BeneficiarioCuentaAhorro } from '../entities/beneficiario-cuenta-ahorro.entity';
import {
  CreateBeneficiarioDto,
  UpdateBeneficiarioDto,
} from '../dto/beneficiario.dto';

@Injectable()
export class BeneficiarioService {
  constructor(
    @InjectRepository(BeneficiarioCuentaAhorro)
    private readonly repo: Repository<BeneficiarioCuentaAhorro>,
  ) {}

  async findByCuenta(
    cuentaAhorroId: number,
  ): Promise<BeneficiarioCuentaAhorro[]> {
    return this.repo.find({
      where: { cuentaAhorroId },
      order: { id: 'ASC' },
    });
  }

  async create(
    cuentaAhorroId: number,
    dto: CreateBeneficiarioDto,
  ): Promise<BeneficiarioCuentaAhorro> {
    // Validar que el porcentaje total no exceda 100
    const existentes = await this.findByCuenta(cuentaAhorroId);
    const totalActual = existentes.reduce(
      (sum, b) => sum + Number(b.porcentajeBeneficio),
      0,
    );
    const nuevoTotal = totalActual + dto.porcentajeBeneficio;

    if (nuevoTotal > 100) {
      throw new BadRequestException(
        `El porcentaje total excedería 100%. Actual: ${totalActual}%, intentando agregar: ${dto.porcentajeBeneficio}%`,
      );
    }

    const { fechaNacimiento, direccion, telefono, email, ...rest } = dto;
    const entity = this.repo.create({
      cuentaAhorroId,
      ...rest,
      ...(fechaNacimiento ? { fechaNacimiento } : {}),
      ...(direccion ? { direccion } : {}),
      ...(telefono ? { telefono } : {}),
      ...(email ? { email } : {}),
    });
    return this.repo.save(entity);
  }

  async createBulk(
    cuentaAhorroId: number,
    dtos: CreateBeneficiarioDto[],
  ): Promise<BeneficiarioCuentaAhorro[]> {
    if (!dtos || dtos.length === 0) return [];

    const total = dtos.reduce(
      (sum, d) => sum + Number(d.porcentajeBeneficio),
      0,
    );
    if (Math.abs(total - 100) > 0.01) {
      throw new BadRequestException(
        `El porcentaje total de beneficiarios debe ser exactamente 100%. Total: ${total}%`,
      );
    }

    // Sanitize: omit empty strings for nullable fields
    // (ValidationPipe skips arrays, so @Transform decorators don't fire)
    const entities = dtos.map((dto) => {
      const { fechaNacimiento, direccion, telefono, email, ...rest } = dto;
      return this.repo.create({
        cuentaAhorroId,
        ...rest,
        ...(fechaNacimiento ? { fechaNacimiento } : {}),
        ...(direccion ? { direccion } : {}),
        ...(telefono ? { telefono } : {}),
        ...(email ? { email } : {}),
      });
    });
    return this.repo.save(entities);
  }

  async update(
    id: number,
    dto: UpdateBeneficiarioDto,
  ): Promise<BeneficiarioCuentaAhorro> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Beneficiario ID ${id} no encontrado`);
    }

    // Si cambia el porcentaje, validar que el total no exceda 100
    if (dto.porcentajeBeneficio !== undefined) {
      const existentes = await this.findByCuenta(entity.cuentaAhorroId);
      const totalSinEste = existentes
        .filter((b) => b.id !== id)
        .reduce((sum, b) => sum + Number(b.porcentajeBeneficio), 0);
      const nuevoTotal = totalSinEste + dto.porcentajeBeneficio;

      if (nuevoTotal > 100) {
        throw new BadRequestException(
          `El porcentaje total excedería 100%. Total otros: ${totalSinEste}%, intentando: ${dto.porcentajeBeneficio}%`,
        );
      }
    }

    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Beneficiario ID ${id} no encontrado`);
    }
    await this.repo.remove(entity);
  }

  async getTotalPorcentaje(cuentaAhorroId: number): Promise<number> {
    const beneficiarios = await this.findByCuenta(cuentaAhorroId);
    return beneficiarios.reduce(
      (sum, b) => sum + Number(b.porcentajeBeneficio),
      0,
    );
  }
}
