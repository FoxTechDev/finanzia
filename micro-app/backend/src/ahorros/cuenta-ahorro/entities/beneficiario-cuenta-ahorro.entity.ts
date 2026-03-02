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

@Entity('beneficiario_cuenta_ahorro')
@Index(['cuentaAhorroId'])
export class BeneficiarioCuentaAhorro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cuentaAhorroId: number;

  @ManyToOne(() => CuentaAhorro, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cuentaAhorroId' })
  cuentaAhorro: CuentaAhorro;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellidos: string;

  @Column({ type: 'date', nullable: true })
  fechaNacimiento: Date;

  @Column({ length: 255, nullable: true })
  direccion: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 50 })
  parentesco: string;

  @Column('decimal', { precision: 5, scale: 2 })
  porcentajeBeneficio: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
