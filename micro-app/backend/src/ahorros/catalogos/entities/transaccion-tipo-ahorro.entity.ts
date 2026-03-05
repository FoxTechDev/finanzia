import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { TipoAhorro } from '../../tipo-ahorro/entities/tipo-ahorro.entity';
import { TipoTransaccionAhorro } from './tipo-transaccion-ahorro.entity';

@Entity('transacciones_tipo_ahorro')
@Unique('uq_tipo_ahorro_transaccion', ['tipoAhorroId', 'tipoTransaccionId'])
export class TransaccionTipoAhorro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tipoAhorroId: number;

  @Column()
  tipoTransaccionId: number;

  @ManyToOne(() => TipoAhorro)
  @JoinColumn({ name: 'tipoAhorroId' })
  tipoAhorro: TipoAhorro;

  @ManyToOne(() => TipoTransaccionAhorro)
  @JoinColumn({ name: 'tipoTransaccionId' })
  tipoTransaccion: TipoTransaccionAhorro;

  @CreateDateColumn()
  createdAt: Date;
}
