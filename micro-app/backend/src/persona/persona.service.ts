import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like, ILike } from 'typeorm';
import { Persona } from './entities/persona.entity';
import { Direccion } from '../direccion/entities/direccion.entity';
import { ActividadEconomica } from '../actividad-economica/entities/actividad-economica.entity';
import { ReferenciaPersonal } from '../referencia-personal/entities/referencia-personal.entity';
import { ReferenciaFamiliar } from '../referencia-familiar/entities/referencia-familiar.entity';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Injectable()
export class PersonaService {
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPersonaDto: CreatePersonaDto): Promise<Persona> {
    const existingPersona = await this.personaRepository.findOne({
      where: { numeroDui: createPersonaDto.numeroDui },
    });

    if (existingPersona) {
      throw new ConflictException('Ya existe una persona con este número de DUI');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { direccion, actividadEconomica, referenciasPersonales, referenciasFamiliares, ...personaData } = createPersonaDto;

      const persona = queryRunner.manager.create(Persona, personaData);
      const savedPersona = await queryRunner.manager.save(persona);

      if (direccion) {
        const direccionEntity = queryRunner.manager.create(Direccion, {
          ...direccion,
          personaId: savedPersona.id,
        });
        await queryRunner.manager.save(direccionEntity);
      }

      if (actividadEconomica) {
        const actividadEntity = queryRunner.manager.create(ActividadEconomica, {
          ...actividadEconomica,
          personaId: savedPersona.id,
        });
        await queryRunner.manager.save(actividadEntity);
      }

      if (referenciasPersonales?.length) {
        const referencias = referenciasPersonales.map((ref) =>
          queryRunner.manager.create(ReferenciaPersonal, {
            ...ref,
            personaId: savedPersona.id,
          }),
        );
        await queryRunner.manager.save(referencias);
      }

      if (referenciasFamiliares?.length) {
        const referencias = referenciasFamiliares.map((ref) =>
          queryRunner.manager.create(ReferenciaFamiliar, {
            ...ref,
            personaId: savedPersona.id,
          }),
        );
        await queryRunner.manager.save(referencias);
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedPersona.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Persona[]> {
    return this.personaRepository.find({
      order: { apellido: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Persona> {
    const persona = await this.personaRepository.findOne({
      where: { id },
      relations: [
        'direccion',
        'direccion.departamento',
        'direccion.municipio',
        'direccion.distrito',
        'actividadEconomica',
        'actividadEconomica.departamento',
        'actividadEconomica.municipio',
        'actividadEconomica.distrito',
        'referenciasPersonales',
        'referenciasFamiliares',
      ],
    });

    if (!persona) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }

    return persona;
  }

  async findByDui(numeroDui: string): Promise<Persona> {
    const persona = await this.personaRepository.findOne({
      where: { numeroDui },
      relations: [
        'direccion',
        'actividadEconomica',
        'referenciasPersonales',
        'referenciasFamiliares',
      ],
    });

    if (!persona) {
      throw new NotFoundException(`Persona con DUI ${numeroDui} no encontrada`);
    }

    return persona;
  }

  async search(query: string, limit: number = 10): Promise<Persona[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = `%${query.trim()}%`;

    // Buscar por DUI, nombre o apellido
    const personas = await this.personaRepository
      .createQueryBuilder('persona')
      .where('persona.numeroDui LIKE :query', { query: searchTerm })
      .orWhere('persona.nombre LIKE :query', { query: searchTerm })
      .orWhere('persona.apellido LIKE :query', { query: searchTerm })
      .orWhere("CONCAT(persona.nombre, ' ', persona.apellido) LIKE :query", {
        query: searchTerm,
      })
      .orderBy('persona.apellido', 'ASC')
      .addOrderBy('persona.nombre', 'ASC')
      .take(limit)
      .getMany();

    return personas;
  }

  async update(id: number, updatePersonaDto: UpdatePersonaDto): Promise<Persona> {
    const persona = await this.findOne(id);

    const { direccion, actividadEconomica, referenciasPersonales, referenciasFamiliares, ...personaData } = updatePersonaDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Actualizar datos de persona
      Object.assign(persona, personaData);
      await queryRunner.manager.save(persona);

      // Actualizar o crear dirección
      if (direccion) {
        if (persona.direccion) {
          Object.assign(persona.direccion, direccion);
          await queryRunner.manager.save(persona.direccion);
        } else {
          const direccionEntity = queryRunner.manager.create(Direccion, {
            ...direccion,
            personaId: id,
          });
          await queryRunner.manager.save(direccionEntity);
        }
      }

      // Actualizar o crear actividad económica
      if (actividadEconomica) {
        if (persona.actividadEconomica) {
          Object.assign(persona.actividadEconomica, actividadEconomica);
          await queryRunner.manager.save(persona.actividadEconomica);
        } else {
          const actividadEntity = queryRunner.manager.create(ActividadEconomica, {
            ...actividadEconomica,
            personaId: id,
          });
          await queryRunner.manager.save(actividadEntity);
        }
      }

      // Eliminar referencias personales existentes y crear nuevas
      if (referenciasPersonales !== undefined) {
        await queryRunner.manager.delete(ReferenciaPersonal, { personaId: id });
        if (referenciasPersonales.length > 0) {
          const referencias = referenciasPersonales.map((ref) =>
            queryRunner.manager.create(ReferenciaPersonal, {
              ...ref,
              personaId: id,
            }),
          );
          await queryRunner.manager.save(referencias);
        }
      }

      // Eliminar referencias familiares existentes y crear nuevas
      if (referenciasFamiliares !== undefined) {
        await queryRunner.manager.delete(ReferenciaFamiliar, { personaId: id });
        if (referenciasFamiliares.length > 0) {
          const referencias = referenciasFamiliares.map((ref) =>
            queryRunner.manager.create(ReferenciaFamiliar, {
              ...ref,
              personaId: id,
            }),
          );
          await queryRunner.manager.save(referencias);
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const persona = await this.findOne(id);
    await this.personaRepository.remove(persona);
  }
}
