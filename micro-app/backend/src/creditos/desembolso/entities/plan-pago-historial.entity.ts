import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Prestamo } from './prestamo.entity';
import { EstadoCuota } from './plan-pago.entity';

@Entity('plan_pago_historial')
@Index(['prestamoId'])
@Index(['loteModificacion'])
@Index(['fechaModificacion'])
export class PlanPagoHistorial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prestamoId: number;

  @ManyToOne(() => Prestamo)
  @JoinColumn({ name: 'prestamoId' })
  prestamo: Prestamo;

  @Column({ length: 50 })
  loteModificacion: string;

  @Column()
  numeroCuota: number;

  @Column({ type: 'date' })
  fechaVencimiento: Date;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  capital: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  interes: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  recargos: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  cuotaTotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  saldoCapital: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  capitalPagado: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  interesPagado: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  recargosPagado: number;

  @Column({ type: 'date', nullable: true })
  fechaPago: Date;

  @Column({ default: 0 })
  diasMora: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  interesMoratorio: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  interesMoratorioPagado: number;

  @Column({
    type: 'enum',
    enum: EstadoCuota,
  })
  estado: EstadoCuota;

  @Column({ type: 'text' })
  observacion: string;

  @Column({ type: 'int', nullable: true })
  usuarioId: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  nombreUsuario: string;

  @CreateDateColumn()
  fechaModificacion: Date;
}
