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
import { TipoCalculo } from '../../desembolso/entities/tipo-deduccion.entity';

/**
 * Entidad para almacenar los recargos aplicados a una solicitud de crédito.
 * Similar a RecargoPrestamo pero para la fase de solicitud.
 * Estos recargos se calculan y almacenan al generar el plan de pago de la solicitud.
 */
@Entity('recargo_solicitud')
@Index(['solicitudId']) // Fast lookup by application
export class RecargoSolicitud {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  solicitudId: number;

  @ManyToOne(() => Solicitud, (solicitud) => solicitud.recargos)
  @JoinColumn({ name: 'solicitudId' })
  solicitud: Solicitud;

  @Column({ length: 100 })
  nombre: string;

  @Column({
    type: 'enum',
    enum: TipoCalculo,
    default: TipoCalculo.FIJO,
  })
  tipo: TipoCalculo;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  valor: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  montoCalculado: number;

  @Column({ default: 1 })
  aplicaDesde: number; // Número de cuota desde

  @Column({ nullable: true })
  aplicaHasta: number; // Número de cuota hasta (null = aplica hasta el final)

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
