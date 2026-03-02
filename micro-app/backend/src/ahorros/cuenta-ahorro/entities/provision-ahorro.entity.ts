import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CuentaAhorro } from './cuenta-ahorro.entity';

@Entity('provision_ahorro')
@Index(['cuentaAhorroId'])
@Index(['fecha'])
export class ProvisionAhorro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cuentaAhorroId: number;

  @ManyToOne(() => CuentaAhorro)
  @JoinColumn({ name: 'cuentaAhorroId' })
  cuentaAhorro: CuentaAhorro;

  @Column({ type: 'date' })
  fecha: Date;

  @Column('decimal', { precision: 14, scale: 2 })
  saldo: number;

  @Column('decimal', { precision: 8, scale: 4 })
  tasaInteres: number;

  @Column('decimal', { precision: 14, scale: 2 })
  interesDiario: number;

  @Column('decimal', { precision: 14, scale: 2 })
  interesAcumulado: number;

  @Column({ default: false })
  pagado: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
