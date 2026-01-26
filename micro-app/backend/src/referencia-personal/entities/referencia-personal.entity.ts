import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Persona } from '../../persona/entities/persona.entity';

@Entity('referencia_personal')
export class ReferenciaPersonal {
  @PrimaryGeneratedColumn({ name: 'idReferencia' })
  id: number;

  @ManyToOne(() => Persona, (persona) => persona.referenciasPersonales, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'idPersona' })
  persona: Persona;

  @Column({ name: 'idPersona' })
  personaId: number;

  @Column({ name: 'nombreReferencia', length: 150 })
  nombreReferencia: string;

  @Column({ length: 80 })
  relacion: string;

  @Column({ name: 'telefonoReferencia', length: 30, nullable: true })
  telefonoReferencia: string;

  @Column({ name: 'direccionReferencia', length: 200, nullable: true })
  direccionReferencia: string;
}
