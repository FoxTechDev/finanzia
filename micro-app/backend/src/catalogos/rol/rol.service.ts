import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createRolDto: CreateRolDto): Promise<Rol> {
    const existingRol = await this.rolRepository.findOne({
      where: { codigo: createRolDto.codigo },
    });

    if (existingRol) {
      throw new ConflictException(`El rol con código ${createRolDto.codigo} ya existe`);
    }

    const rol = this.rolRepository.create(createRolDto);
    return this.rolRepository.save(rol);
  }

  async findAll(): Promise<Rol[]> {
    return this.rolRepository.find({
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findAllActive(): Promise<Rol[]> {
    return this.rolRepository.find({
      where: { activo: true },
      order: { orden: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Rol> {
    const rol = await this.rolRepository.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return rol;
  }

  async findByCodigo(codigo: string): Promise<Rol> {
    const rol = await this.rolRepository.findOne({ where: { codigo } });
    if (!rol) {
      throw new NotFoundException(`Rol con código ${codigo} no encontrado`);
    }
    return rol;
  }

  async update(id: number, updateRolDto: UpdateRolDto): Promise<Rol> {
    const rol = await this.findOne(id);

    if (updateRolDto.codigo && updateRolDto.codigo !== rol.codigo) {
      const existingRol = await this.rolRepository.findOne({
        where: { codigo: updateRolDto.codigo },
      });
      if (existingRol) {
        throw new ConflictException(`El rol con código ${updateRolDto.codigo} ya existe`);
      }
    }

    Object.assign(rol, updateRolDto);
    return this.rolRepository.save(rol);
  }

  async remove(id: number): Promise<void> {
    const rol = await this.findOne(id);
    await this.rolRepository.remove(rol);
  }
}
