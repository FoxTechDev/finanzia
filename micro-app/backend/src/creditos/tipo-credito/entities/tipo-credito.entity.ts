import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { LineaCredito } from '../../linea-credito/entities/linea-credito.entity';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';

@Entity('tipo_credito')
export class TipoCredito {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  codigo: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column()
  lineaCreditoId: number;

  @ManyToOne(() => LineaCredito, (linea) => linea.tiposCredito)
  @JoinColumn({ name: 'lineaCreditoId' })
  lineaCredito: LineaCredito;

  // Tasas de interés (en porcentaje anual, puede ser superior a 100%)
  @Column({ type: 'decimal', precision: 6, scale: 2 })
  tasaInteres: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  tasaInteresMinima: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  tasaInteresMaxima: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  tasaInteresMoratorio: number;

  // Montos (en USD)
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  montoMinimo: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  montoMaximo: number;

  // Plazos (en meses)
  @Column()
  plazoMinimo: number;

  @Column()
  plazoMaximo: number;

  // Periodicidad de pago (mensual, quincenal, semanal)
  @Column({ length: 20, default: 'mensual' })
  periodicidadPago: string;

  // Tipo de cuota (fija, variable)
  @Column({ length: 20, default: 'fija' })
  tipoCuota: string;

  // Días de gracia
  @Column({ default: 0 })
  diasGracia: number;

  // Requiere garantía
  @Column({ default: false })
  requiereGarantia: boolean;

  // Recargo manual (no aplica interés moratorio automático)
  // Si es true, en lugar de calcular interés moratorio, se aplica un recargo fijo editable
  @Column({ default: false })
  aplicaRecargoManual: boolean;

  // Monto del recargo manual que se aplica cuando hay atraso
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  montoRecargo: number;

  // Vigencia del producto
  @Column({ type: 'date' })
  fechaVigenciaDesde: Date;

  @Column({ type: 'date', nullable: true })
  fechaVigenciaHasta: Date;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Solicitud, (solicitud) => solicitud.tipoCredito)
  solicitudes: Solicitud[];
}
