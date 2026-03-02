import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CuentaAhorro } from './cuenta-ahorro.entity';

@Entity('plan_capitalizacion')
@Index(['cuentaAhorroId'])
@Index(['fechaCapitalizacion'])
export class PlanCapitalizacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cuentaAhorroId: number;

  @ManyToOne(() => CuentaAhorro, (cuenta) => cuenta.planCapitalizacion)
  @JoinColumn({ name: 'cuentaAhorroId' })
  cuentaAhorro: CuentaAhorro;

  @Column({ type: 'date' })
  fechaCapitalizacion: Date;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  monto: number;

  @Column({ default: false })
  procesado: boolean;

  @Column({ type: 'date', nullable: true })
  fechaProcesado: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
