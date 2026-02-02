import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Persona } from '../../persona/entities/persona.entity';

export enum Parentesco {
  HIJO = 'Hijo',
  HIJA = 'Hija',
  CONYUGE = 'Cónyuge',
  PADRE = 'Padre',
  MADRE = 'Madre',
  HERMANO = 'Hermano',
  HERMANA = 'Hermana',
  ABUELO = 'Abuelo',
  ABUELA = 'Abuela',
  OTRO = 'Otro',
}

@Entity('dependencia_familiar')
@Index(['personaId']) // Fast lookup by persona
export class DependenciaFamiliar {
  @PrimaryGeneratedColumn({ name: 'idDependencia' })
  id: number;

  @ManyToOne(() => Persona, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'idPersona' })
  persona: Persona;

  @Column({ name: 'idPersona' })
  personaId: number;

  @Column({ name: 'nombreDependiente', length: 150 })
  nombreDependiente: string;

  @Column({
    type: 'enum',
    enum: Parentesco,
    default: Parentesco.OTRO,
  })
  parentesco: Parentesco;

  @Column({ type: 'int', nullable: true })
  edad: number;

  @Column({ type: 'boolean', default: false })
  trabaja: boolean;

  @Column({ type: 'boolean', default: false })
  estudia: boolean;

  @Column({ type: 'text', nullable: true })
  observaciones: string;
}
