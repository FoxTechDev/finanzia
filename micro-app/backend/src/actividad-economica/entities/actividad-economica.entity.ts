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

@Entity('actividad_economica')
export class ActividadEconomica {
  @PrimaryGeneratedColumn({ name: 'idActividad' })
  id: number;

  @OneToOne(() => Persona, (persona) => persona.actividadEconomica, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'idPersona' })
  persona: Persona;

  @Column({ name: 'idPersona' })
  personaId: number;

  @Column({ name: 'tipoActividad', length: 60 })
  tipoActividad: string;

  @Column({ name: 'nombreEmpresa', length: 150, nullable: true })
  nombreEmpresa: string;

  @Column({ name: 'cargoOcupacion', length: 120, nullable: true })
  cargoOcupacion: string;

  @Column({
    name: 'ingresosMensuales',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  ingresosMensuales: number;

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

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud: number;
}
