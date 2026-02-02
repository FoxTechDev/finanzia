import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Persona } from '../../persona/entities/persona.entity';
import { TipoIngreso } from '../../tipo-ingreso/entities/tipo-ingreso.entity';

@Entity('ingreso_cliente')
export class IngresoCliente {
  @PrimaryGeneratedColumn({ name: 'idIngreso' })
  id: number;

  @ManyToOne(() => Persona, (persona) => persona.ingresos, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'idPersona' })
  persona: Persona;

  @Column({ name: 'idPersona' })
  personaId: number;

  @ManyToOne(() => TipoIngreso, (tipo) => tipo.ingresos)
  @JoinColumn({ name: 'idTipoIngreso' })
  tipoIngreso: TipoIngreso;

  @Column({ name: 'idTipoIngreso' })
  tipoIngresoId: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
  })
  monto: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;
}
