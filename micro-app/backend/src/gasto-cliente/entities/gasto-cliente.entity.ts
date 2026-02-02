import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Persona } from '../../persona/entities/persona.entity';
import { TipoGasto } from '../../tipo-gasto/entities/tipo-gasto.entity';

@Entity('gasto_cliente')
export class GastoCliente {
  @PrimaryGeneratedColumn({ name: 'idGasto' })
  id: number;

  @ManyToOne(() => Persona, (persona) => persona.gastos, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'idPersona' })
  persona: Persona;

  @Column({ name: 'idPersona' })
  personaId: number;

  @ManyToOne(() => TipoGasto, (tipo) => tipo.gastos)
  @JoinColumn({ name: 'idTipoGasto' })
  tipoGasto: TipoGasto;

  @Column({ name: 'idTipoGasto' })
  tipoGastoId: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  monto: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;
}
