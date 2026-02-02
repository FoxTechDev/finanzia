import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Persona } from '../../persona/entities/persona.entity';
import { Departamento } from '../../departamento/entities/departamento.entity';
import { Municipio } from '../../municipio/entities/municipio.entity';
import { Distrito } from '../../distrito/entities/distrito.entity';
import { TipoVivienda } from '../../tipo-vivienda/entities/tipo-vivienda.entity';

@Entity('direccion')
export class Direccion {
  @PrimaryGeneratedColumn({ name: 'idDireccion' })
  id: number;

  @OneToOne(() => Persona, (persona) => persona.direccion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idPersona' })
  persona: Persona;

  @Column({ name: 'idPersona' })
  personaId: number;

  @ManyToOne(() => Departamento)
  @JoinColumn({ name: 'idDepartamento' })
  departamento: Departamento;

  @Column({ name: 'idDepartamento' })
  departamentoId: number;

  @ManyToOne(() => Municipio)
  @JoinColumn({ name: 'idMunicipio' })
  municipio: Municipio;

  @Column({ name: 'idMunicipio' })
  municipioId: number;

  @ManyToOne(() => Distrito)
  @JoinColumn({ name: 'idDistrito' })
  distrito: Distrito;

  @Column({ name: 'idDistrito' })
  distritoId: number;

  @Column({ name: 'detalleDireccion', length: 200, nullable: true })
  detalleDireccion: string;

  // Relación con tipo de vivienda
  @ManyToOne(() => TipoVivienda, (tipoVivienda) => tipoVivienda.direcciones, { nullable: true })
  @JoinColumn({ name: 'idTipoVivienda' })
  tipoVivienda: TipoVivienda;

  @Column({ name: 'idTipoVivienda', nullable: true })
  tipoViviendaId: number;

  @Column({ name: 'tiempoResidenciaAnios', type: 'int', nullable: true })
  tiempoResidenciaAnios: number;
}
