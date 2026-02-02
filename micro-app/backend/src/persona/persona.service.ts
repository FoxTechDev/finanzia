import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like, ILike } from 'typeorm';
import { Persona } from './entities/persona.entity';
import { Direccion } from '../direccion/entities/direccion.entity';
import { ActividadEconomica } from '../actividad-economica/entities/actividad-economica.entity';
import { ReferenciaPersonal } from '../referencia-personal/entities/referencia-personal.entity';
import { ReferenciaFamiliar } from '../referencia-familiar/entities/referencia-familiar.entity';
import { DependenciaFamiliar } from '../dependencia-familiar/entities/dependencia-familiar.entity';
import { IngresoCliente } from '../ingreso-cliente/entities/ingreso-cliente.entity';
import { GastoCliente } from '../gasto-cliente/entities/gasto-cliente.entity';
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
      const { direccion, actividadEconomica, referenciasPersonales, referenciasFamiliares, dependenciasFamiliares, ingresos, gastos, ...personaData } = createPersonaDto;

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

      if (dependenciasFamiliares?.length) {
        const dependencias = dependenciasFamiliares.map((dep) =>
          queryRunner.manager.create(DependenciaFamiliar, {
            ...dep,
            personaId: savedPersona.id,
          }),
        );
        await queryRunner.manager.save(dependencias);
      }

      if (ingresos?.length) {
        const ingresosEntities = ingresos.map((ingreso) =>
          queryRunner.manager.create(IngresoCliente, {
            ...ingreso,
            personaId: savedPersona.id,
          }),
        );
        await queryRunner.manager.save(ingresosEntities);
      }

      if (gastos?.length) {
        const gastosEntities = gastos.map((gasto) =>
          queryRunner.manager.create(GastoCliente, {
            ...gasto,
            personaId: savedPersona.id,
          }),
        );
        await queryRunner.manager.save(gastosEntities);
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
        'dependenciasFamiliares',
        'ingresos',
        'ingresos.tipoIngreso',
        'gastos',
        'gastos.tipoGasto',
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
        'dependenciasFamiliares',
        'ingresos',
        'ingresos.tipoIngreso',
        'gastos',
        'gastos.tipoGasto',
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

    const { direccion, actividadEconomica, referenciasPersonales, referenciasFamiliares, dependenciasFamiliares, ingresos, gastos, ...personaData } = updatePersonaDto;

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
          // Cargar la entidad direccion y actualizar solo campos definidos
          const direccionEntity = await queryRunner.manager.findOne(Direccion, {
            where: { id: persona.direccion.id },
          });
          if (direccionEntity) {
            if (direccion.departamentoId !== undefined) direccionEntity.departamentoId = direccion.departamentoId;
            if (direccion.municipioId !== undefined) direccionEntity.municipioId = direccion.municipioId;
            if (direccion.distritoId !== undefined) direccionEntity.distritoId = direccion.distritoId;
            if (direccion.detalleDireccion !== undefined) direccionEntity.detalleDireccion = direccion.detalleDireccion;
            if (direccion.tipoViviendaId !== undefined) direccionEntity.tipoViviendaId = direccion.tipoViviendaId;
            if (direccion.tiempoResidenciaAnios !== undefined) direccionEntity.tiempoResidenciaAnios = direccion.tiempoResidenciaAnios;
            await queryRunner.manager.save(direccionEntity);
          }
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
          // Cargar la entidad actividad económica y actualizar solo campos definidos
          const actividadEntity = await queryRunner.manager.findOne(ActividadEconomica, {
            where: { id: persona.actividadEconomica.id },
          });
          if (actividadEntity) {
            if (actividadEconomica.tipoActividad !== undefined) actividadEntity.tipoActividad = actividadEconomica.tipoActividad;
            if (actividadEconomica.nombreEmpresa !== undefined) actividadEntity.nombreEmpresa = actividadEconomica.nombreEmpresa;
            if (actividadEconomica.cargoOcupacion !== undefined) actividadEntity.cargoOcupacion = actividadEconomica.cargoOcupacion;
            if (actividadEconomica.ingresosMensuales !== undefined) actividadEntity.ingresosMensuales = actividadEconomica.ingresosMensuales;
            if (actividadEconomica.departamentoId !== undefined) actividadEntity.departamentoId = actividadEconomica.departamentoId;
            if (actividadEconomica.municipioId !== undefined) actividadEntity.municipioId = actividadEconomica.municipioId;
            if (actividadEconomica.distritoId !== undefined) actividadEntity.distritoId = actividadEconomica.distritoId;
            if (actividadEconomica.detalleDireccion !== undefined) actividadEntity.detalleDireccion = actividadEconomica.detalleDireccion;
            if (actividadEconomica.latitud !== undefined) actividadEntity.latitud = actividadEconomica.latitud;
            if (actividadEconomica.longitud !== undefined) actividadEntity.longitud = actividadEconomica.longitud;
            await queryRunner.manager.save(actividadEntity);
          }
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

      // Eliminar dependencias familiares existentes y crear nuevas
      if (dependenciasFamiliares !== undefined) {
        await queryRunner.manager.delete(DependenciaFamiliar, { personaId: id });
        if (dependenciasFamiliares.length > 0) {
          const dependencias = dependenciasFamiliares.map((dep) =>
            queryRunner.manager.create(DependenciaFamiliar, {
              ...dep,
              personaId: id,
            }),
          );
          await queryRunner.manager.save(dependencias);
        }
      }

      // Eliminar ingresos existentes y crear nuevos
      if (ingresos !== undefined) {
        await queryRunner.manager.delete(IngresoCliente, { personaId: id });
        if (ingresos.length > 0) {
          const ingresosEntities = ingresos.map((ingreso) =>
            queryRunner.manager.create(IngresoCliente, {
              ...ingreso,
              personaId: id,
            }),
          );
          await queryRunner.manager.save(ingresosEntities);
        }
      }

      // Eliminar gastos existentes y crear nuevos
      if (gastos !== undefined) {
        await queryRunner.manager.delete(GastoCliente, { personaId: id });
        if (gastos.length > 0) {
          const gastosEntities = gastos.map((gasto) =>
            queryRunner.manager.create(GastoCliente, {
              ...gasto,
              personaId: id,
            }),
          );
          await queryRunner.manager.save(gastosEntities);
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
