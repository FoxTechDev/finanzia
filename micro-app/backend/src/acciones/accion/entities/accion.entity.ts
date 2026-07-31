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
import { Persona } from '../../../persona/entities/persona.entity';
import { TipoAccion } from '../../tipo-accion/entities/tipo-accion.entity';
import { CuentaAhorro } from '../../../ahorros/cuenta-ahorro/entities/cuenta-ahorro.entity';
import { Banco } from '../../../bancos/banco.entity';

@Entity('accion')
@Index(['correlativo'], { unique: true })
@Index(['personaId'])
export class Accion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  correlativo: string;

  @Column()
  personaId: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'personaId' })
  persona: Persona;

  @Column()
  tipoAccionId: number;

  @ManyToOne(() => TipoAccion)
  @JoinColumn({ name: 'tipoAccionId' })
  tipoAccion: TipoAccion;

  @Column({ type: 'date' })
  fechaApertura: Date;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  monto: number;

  @Column('decimal', { precision: 14, scale: 4, default: 0 })
  cantidadAcciones: number;

  @Column('decimal', { precision: 8, scale: 4, default: 0 })
  tasaInteres: number;

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

  @Column({ default: true })
  activa: boolean;

  @Column({ type: 'date', nullable: true })
  fechaUltimoPagoIntereses: Date;

  @Column({ length: 200, nullable: true })
  observacion: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
