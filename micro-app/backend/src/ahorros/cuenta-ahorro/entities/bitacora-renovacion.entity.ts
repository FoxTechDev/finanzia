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

@Entity('bitacora_renovacion')
@Index(['cuentaAhorroId'])
export class BitacoraRenovacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cuentaAhorroId: number;

  @ManyToOne(() => CuentaAhorro)
  @JoinColumn({ name: 'cuentaAhorroId' })
  cuentaAhorro: CuentaAhorro;

  @Column({ type: 'date' })
  fechaRenovacion: Date;

  @Column({ type: 'date' })
  vencimientoAnterior: Date;

  @Column({ type: 'date' })
  nuevoVencimiento: Date;

  @Column({ nullable: true })
  usuarioId: number;

  @Column({ length: 100, nullable: true })
  nombreUsuario: string;

  @CreateDateColumn()
  createdAt: Date;
}
