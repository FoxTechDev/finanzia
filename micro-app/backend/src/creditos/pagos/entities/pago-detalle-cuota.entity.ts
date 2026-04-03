import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pago } from './pago.entity';
import { PlanPago, EstadoCuota } from '../../desembolso/entities/plan-pago.entity';

@Entity('pago_detalle_cuota')
export class PagoDetalleCuota {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pagoId: number;

  @ManyToOne(() => Pago, (pago) => pago.detallesCuota)
  @JoinColumn({ name: 'pagoId' })
  pago: Pago;

  @Column()
  planPagoId: number;

  @ManyToOne(() => PlanPago)
  @JoinColumn({ name: 'planPagoId' })
  planPago: PlanPago;

  @Column()
  numeroCuota: number;

  // Montos aplicados a esta cuota específica
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  capitalAplicado: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  interesAplicado: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  recargosAplicado: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  interesMoratorioAplicado: number;

  // Estado ANTERIOR de la cuota (para reversa)
  @Column({
    type: 'enum',
    enum: EstadoCuota,
  })
  estadoCuotaAnterior: EstadoCuota;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  capitalPagadoAnterior: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  interesPagadoAnterior: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  recargosPagadoAnterior: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  interesMoratorioPagadoAnterior: number;

  @Column({ default: 0 })
  diasMoraAnterior: number;

  // Estado POSTERIOR de la cuota
  @Column({
    type: 'enum',
    enum: EstadoCuota,
  })
  estadoCuotaPosterior: EstadoCuota;

  @CreateDateColumn()
  createdAt: Date;
}
