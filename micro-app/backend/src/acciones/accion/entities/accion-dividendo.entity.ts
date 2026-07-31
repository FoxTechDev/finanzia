import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Accion } from './accion.entity';

@Entity('accion_dividendo')
@Index(['accionId'])
export class AccionDividendo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accionId: number;

  @ManyToOne(() => Accion)
  @JoinColumn({ name: 'accionId' })
  accion: Accion;

  @Column({ type: 'date' })
  fecha: Date;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  monto: number;

  @CreateDateColumn()
  createdAt: Date;
}
