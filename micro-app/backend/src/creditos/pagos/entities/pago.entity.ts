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
import { Prestamo } from '../../desembolso/entities/prestamo.entity';
import { PagoDetalleCuota } from './pago-detalle-cuota.entity';

export enum TipoPago {
  CUOTA_COMPLETA = 'CUOTA_COMPLETA',
  PAGO_PARCIAL = 'PAGO_PARCIAL',
  PAGO_ADELANTADO = 'PAGO_ADELANTADO',
  CANCELACION_TOTAL = 'CANCELACION_TOTAL',
}

export enum EstadoPago {
  APLICADO = 'APLICADO',
  ANULADO = 'ANULADO',
}

@Entity('pago')
@Index(['prestamoId']) // Fast lookup by loan
@Index(['numeroPago']) // Fast lookup by payment number
@Index(['fechaPago']) // Date-based queries
@Index(['fechaRegistro']) // Order by registration date
@Index(['estado']) // Filter by status
@Index(['prestamoId', 'estado']) // Composite for loan + status
@Index(['prestamoId', 'fechaPago']) // Composite for loan payment history
@Index(['usuarioId']) // User activity reports
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prestamoId: number;

  @ManyToOne(() => Prestamo)
  @JoinColumn({ name: 'prestamoId' })
  prestamo: Prestamo;

  // Número único del pago (ej: PAG2026000001)
  @Column({ length: 20, unique: true })
  numeroPago: string;

  // Fechas
  @Column({ type: 'date' })
  fechaPago: Date;

  @Column({ type: 'datetime' })
  fechaRegistro: Date;

  // Monto total pagado
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  montoPagado: number;

  // Distribución del pago
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  capitalAplicado: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  interesAplicado: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  recargosAplicado: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  interesMoratorioAplicado: number;

  // Saldos ANTERIORES (para reversa en caso de anulación)
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  saldoCapitalAnterior: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  saldoInteresAnterior: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  capitalMoraAnterior: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  interesMoraAnterior: number;

  @Column({ default: 0 })
  diasMoraAnterior: number;

  // Saldos POSTERIORES (después de aplicar el pago)
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  saldoCapitalPosterior: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  saldoInteresPosterior: number;

  // Tipo de pago
  @Column({
    type: 'enum',
    enum: TipoPago,
    default: TipoPago.CUOTA_COMPLETA,
  })
  tipoPago: TipoPago;

  // Estado del pago
  @Column({
    type: 'enum',
    enum: EstadoPago,
    default: EstadoPago.APLICADO,
  })
  estado: EstadoPago;

  // Información de anulación
  @Column({ type: 'datetime', nullable: true })
  fechaAnulacion: Date;

  @Column({ type: 'text', nullable: true })
  motivoAnulacion: string;

  @Column({ nullable: true })
  usuarioAnulacionId: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  nombreUsuarioAnulacion: string;

  // Auditoría
  @Column({ nullable: true })
  usuarioId: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  nombreUsuario: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relación con detalles de cuotas afectadas
  @OneToMany(() => PagoDetalleCuota, (detalle) => detalle.pago)
  detallesCuota: PagoDetalleCuota[];
}
