import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NaturalezaMovimientoAhorro } from './naturaleza-movimiento-ahorro.entity';

@Entity('tipo_transaccion_ahorro')
export class TipoTransaccionAhorro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  codigo: string;

  @Column({ length: 50 })
  nombre: string;

  @Column({ nullable: true })
  naturalezaId: number;

  @ManyToOne(() => NaturalezaMovimientoAhorro)
  @JoinColumn({ name: 'naturalezaId' })
  naturaleza: NaturalezaMovimientoAhorro;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
