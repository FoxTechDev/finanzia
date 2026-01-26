import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Persona } from '../../persona/entities/persona.entity';

@Entity('referencia_familiar')
export class ReferenciaFamiliar {
  @PrimaryGeneratedColumn({ name: 'idFamiliar' })
  id: number;

  @ManyToOne(() => Persona, (persona) => persona.referenciasFamiliares, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'idPersona' })
  persona: Persona;

  @Column({ name: 'idPersona' })
  personaId: number;

  @Column({ name: 'nombreFamiliar', length: 150 })
  nombreFamiliar: string;

  @Column({ length: 80 })
  parentesco: string;

  @Column({ name: 'telefonoFamiliar', length: 30, nullable: true })
  telefonoFamiliar: string;

  @Column({ name: 'direccionFamiliar', length: 200, nullable: true })
  direccionFamiliar: string;
}
