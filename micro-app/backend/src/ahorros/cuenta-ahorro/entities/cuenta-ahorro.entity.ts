import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Persona } from '../../../persona/entities/persona.entity';
import { TipoAhorro } from '../../tipo-ahorro/entities/tipo-ahorro.entity';
import { EstadoCuentaAhorro } from '../../catalogos/entities/estado-cuenta-ahorro.entity';
import { TipoCapitalizacion } from '../../catalogos/entities/tipo-capitalizacion.entity';
import { TransaccionAhorro } from './transaccion-ahorro.entity';
import { PlanCapitalizacion } from './plan-capitalizacion.entity';
import { Banco } from '../../../bancos/banco.entity';

@Entity('cuenta_ahorro')
@Index(['noCuenta'], { unique: true })
@Index(['personaId'])
export class CuentaAhorro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  noCuenta: string;

  @Column()
  personaId: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'personaId' })
  persona: Persona;

  @Column()
  tipoAhorroId: number;

  @ManyToOne(() => TipoAhorro)
  @JoinColumn({ name: 'tipoAhorroId' })
  tipoAhorro: TipoAhorro;

  @Column()
  estadoId: number;

  @ManyToOne(() => EstadoCuentaAhorro)
  @JoinColumn({ name: 'estadoId' })
  estado: EstadoCuentaAhorro;

  @Column({ nullable: true })
  tipoCapitalizacionId: number;

  @ManyToOne(() => TipoCapitalizacion)
  @JoinColumn({ name: 'tipoCapitalizacionId' })
  tipoCapitalizacion: TipoCapitalizacion;

  @Column({ type: 'date' })
  fechaApertura: Date;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: Date;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  monto: number;

  @Column({ default: 0 })
  plazo: number;

  @Column('decimal', { precision: 8, scale: 4, default: 0 })
  tasaInteres: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  saldo: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  saldoDisponible: number;

  @Column({ default: false })
  pignorado: boolean;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  montoPignorado: number;

  @Column({ type: 'date', nullable: true })
  fechaUltMovimiento: Date;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  saldoInteres: number;

  @Column({ type: 'date', nullable: true })
  fechaCancelacion: Date;

  @Column({ nullable: true })
  cuentaAhorroDestinoId: number;

  @ManyToOne(() => CuentaAhorro)
  @JoinColumn({ name: 'cuentaAhorroDestinoId' })
  cuentaAhorroDestino: CuentaAhorro;

  @Column({ nullable: true })
  bancoId: number;

  @ManyToOne(() => Banco)
  @JoinColumn({ name: 'bancoId' })
  banco: Banco;

  @Column({ length: 30, nullable: true })
  cuentaBancoNumero: string;

  @Column({ length: 100, nullable: true })
  cuentaBancoPropietario: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true, default: null })
  deletedAt: Date;

  @OneToMany(() => TransaccionAhorro, (t) => t.cuentaAhorro)
  transacciones: TransaccionAhorro[];

  @OneToMany(() => PlanCapitalizacion, (p) => p.cuentaAhorro)
  planCapitalizacion: PlanCapitalizacion[];
}
