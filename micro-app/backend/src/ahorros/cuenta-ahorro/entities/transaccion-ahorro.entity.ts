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
import { NaturalezaMovimientoAhorro } from '../../catalogos/entities/naturaleza-movimiento-ahorro.entity';
import { TipoTransaccionAhorro } from '../../catalogos/entities/tipo-transaccion-ahorro.entity';

@Entity('transaccion_ahorro')
@Index(['cuentaAhorroId'])
@Index(['fecha'])
export class TransaccionAhorro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cuentaAhorroId: number;

  @ManyToOne(() => CuentaAhorro, (cuenta) => cuenta.transacciones)
  @JoinColumn({ name: 'cuentaAhorroId' })
  cuentaAhorro: CuentaAhorro;

  @Column({ type: 'date' })
  fecha: Date;

  @Column('decimal', { precision: 14, scale: 2 })
  monto: number;

  @Column()
  naturalezaId: number;

  @ManyToOne(() => NaturalezaMovimientoAhorro)
  @JoinColumn({ name: 'naturalezaId' })
  naturaleza: NaturalezaMovimientoAhorro;

  @Column()
  tipoTransaccionId: number;

  @ManyToOne(() => TipoTransaccionAhorro)
  @JoinColumn({ name: 'tipoTransaccionId' })
  tipoTransaccion: TipoTransaccionAhorro;

  @Column('decimal', { precision: 14, scale: 2 })
  saldoAnterior: number;

  @Column('decimal', { precision: 14, scale: 2 })
  nuevoSaldo: number;

  @Column({ length: 200, nullable: true })
  observacion: string;

  @Column({ nullable: true })
  usuarioId: number;

  @Column({ length: 100, nullable: true })
  nombreUsuario: string;

  @CreateDateColumn()
  createdAt: Date;
}
