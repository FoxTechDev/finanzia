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
import { Solicitud } from './solicitud.entity';

/**
 * Entidad para almacenar el plan de pago calculado de una solicitud de crédito.
 * Este plan se calcula y almacena al aprobar la solicitud, antes del desembolso.
 * Una vez desembolsado, se crea un plan de pago real en la tabla plan_pago.
 */
@Entity('plan_pago_solicitud')
@Index(['solicitudId']) // Fast lookup by application
@Index(['solicitudId', 'numeroCuota']) // Composite index for specific installment
@Index(['fechaVencimiento']) // Date-based queries
export class PlanPagoSolicitud {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  solicitudId: number;

  @ManyToOne(() => Solicitud, (solicitud) => solicitud.planPago)
  @JoinColumn({ name: 'solicitudId' })
  solicitud: Solicitud;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
