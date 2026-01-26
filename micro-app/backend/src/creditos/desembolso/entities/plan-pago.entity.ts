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
import { Prestamo } from './prestamo.entity';

export enum EstadoCuota {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  PARCIAL = 'PARCIAL',
  MORA = 'MORA',
}

@Entity('plan_pago')
@Index(['prestamoId']) // Fast lookup by loan
@Index(['prestamoId', 'numeroCuota']) // Composite index for specific installment
@Index(['fechaVencimiento']) // Date-based queries (upcoming payments)
@Index(['estado']) // Filter by payment status
@Index(['prestamoId', 'estado']) // Composite for loan + status queries
@Index(['fechaVencimiento', 'estado']) // Due dates + status (overdue payments)
export class PlanPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prestamoId: number;

  @ManyToOne(() => Prestamo, (prestamo) => prestamo.planPago)
  @JoinColumn({ name: 'prestamoId' })
  prestamo: Prestamo;

  @Column()
  numeroCuota: number;

  @Column({ type: 'date' })
  fechaVencimiento: Date;

  // Componentes de la cuota
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  capital: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  interes: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  recargos: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  cuotaTotal: number;

  // Saldo después de esta cuota
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  saldoCapital: number;

  // Montos pagados
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  capitalPagado: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  interesPagado: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  recargosPagado: number;

  // Fecha real de pago
  @Column({ type: 'date', nullable: true })
  fechaPago: Date;

  // Mora
  @Column({ default: 0 })
  diasMora: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  interesMoratorio: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  interesMoratorioPagado: number;

  @Column({
    type: 'enum',
    enum: EstadoCuota,
    default: EstadoCuota.PENDIENTE,
  })
  estado: EstadoCuota;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
