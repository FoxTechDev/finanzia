import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { Persona } from '../../../persona/entities/persona.entity';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';
import { TipoCredito } from '../../tipo-credito/entities/tipo-credito.entity';
import { PlanPago } from './plan-pago.entity';
import { DeduccionPrestamo } from './deduccion-prestamo.entity';
import { RecargoPrestamo } from './recargo-prestamo.entity';
import { ClasificacionPrestamo } from './clasificacion-prestamo.entity';
import { EstadoPrestamo as EstadoPrestamoEntity } from './estado-prestamo.entity';
import { Pago } from '../../pagos/entities/pago.entity';

export enum TipoInteres {
  FLAT = 'FLAT',
  AMORTIZADO = 'AMORTIZADO',
}

export enum PeriodicidadPago {
  DIARIO = 'DIARIO',
  SEMANAL = 'SEMANAL',
  QUINCENAL = 'QUINCENAL',
  MENSUAL = 'MENSUAL',
  TRIMESTRAL = 'TRIMESTRAL',
  SEMESTRAL = 'SEMESTRAL',
  ANUAL = 'ANUAL',
  AL_VENCIMIENTO = 'AL_VENCIMIENTO',
}

export enum EstadoPrestamo {
  VIGENTE = 'VIGENTE',
  MORA = 'MORA',
  CANCELADO = 'CANCELADO',
  CASTIGADO = 'CASTIGADO',
}

export enum CategoriaNCB022 {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
}

@Entity('prestamo')
@Index(['personaId']) // Fast lookup by customer
@Index(['numeroCredito']) // Fast lookup by credit number
@Index(['estado']) // Filter by status (VIGENTE, MORA, CANCELADO, etc.)
@Index(['fechaOtorgamiento']) // Date range queries
@Index(['fechaVencimiento']) // Upcoming due dates
@Index(['personaId', 'estado']) // Composite index for customer + status queries
@Index(['estado', 'fechaVencimiento']) // Composite index for status + due date
@Index(['solicitudId']) // Fast lookup by solicitud (already unique but good for joins)
@Index(['tipoCreditoId']) // Reports by credit type
export class Prestamo {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación con solicitud (1:1)
  @Column({ unique: true })
  solicitudId: number;

  @OneToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitudId' })
  solicitud: Solicitud;

  // Relación con persona/cliente
  @Column()
  personaId: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'personaId' })
  persona: Persona;

  // Número único del crédito
  @Column({ length: 20, unique: true })
  numeroCredito: string;

  // Tipo de crédito
  @Column()
  tipoCreditoId: number;

  @ManyToOne(() => TipoCredito)
  @JoinColumn({ name: 'tipoCreditoId' })
  tipoCredito: TipoCredito;

  // Montos
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  montoAutorizado: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  montoDesembolsado: number;

  // Plazo y tasas
  @Column()
  plazoAutorizado: number;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  tasaInteres: number;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  tasaInteresMoratorio: number;

  @Column({
    type: 'enum',
    enum: TipoInteres,
    default: TipoInteres.FLAT,
  })
  tipoInteres: TipoInteres;

  @Column({
    type: 'enum',
    enum: PeriodicidadPago,
    default: PeriodicidadPago.MENSUAL,
  })
  periodicidadPago: PeriodicidadPago;

  // Cuotas
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  cuotaNormal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  cuotaTotal: number;

  @Column()
  numeroCuotas: number;

  // Totales
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  totalInteres: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  totalRecargos: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  totalPagar: number;

  // Saldos
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  saldoCapital: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  saldoInteres: number;

  // Mora
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  capitalMora: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  interesMora: number;

  @Column({ default: 0 })
  diasMora: number;

  // Fechas importantes
  @Column({ type: 'date' })
  fechaOtorgamiento: Date;

  @Column({ type: 'date' })
  fechaPrimeraCuota: Date;

  @Column({ type: 'date' })
  fechaVencimiento: Date;

  @Column({ type: 'date', nullable: true })
  fechaUltimoPago: Date;

  @Column({ type: 'date', nullable: true })
  fechaCancelacion: Date;

  // Clasificación NCB-022 (El Salvador) - Relación con catálogo
  @Column({ nullable: true })
  clasificacionPrestamoId: number;

  @ManyToOne(() => ClasificacionPrestamo)
  @JoinColumn({ name: 'clasificacionPrestamoId' })
  clasificacionPrestamo: ClasificacionPrestamo;

  // Clasificación NCB-022 (El Salvador) - Enum legacy (mantener compatibilidad)
  @Column({
    type: 'enum',
    enum: CategoriaNCB022,
    default: CategoriaNCB022.A,
  })
  categoriaNCB022: CategoriaNCB022;

  // Estado del préstamo - Relación con catálogo
  @Column({ nullable: true })
  estadoPrestamoId: number;

  @ManyToOne(() => EstadoPrestamoEntity)
  @JoinColumn({ name: 'estadoPrestamoId' })
  estadoPrestamoRelacion: EstadoPrestamoEntity;

  // Estado del préstamo - Enum legacy (mantener compatibilidad)
  @Column({
    type: 'enum',
    enum: EstadoPrestamo,
    default: EstadoPrestamo.VIGENTE,
  })
  estado: EstadoPrestamo;

  // Auditoría
  @Column({ nullable: true })
  usuarioDesembolsoId: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  nombreUsuarioDesembolso: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => PlanPago, (planPago) => planPago.prestamo)
  planPago: PlanPago[];

  @OneToMany(() => DeduccionPrestamo, (deduccion) => deduccion.prestamo)
  deducciones: DeduccionPrestamo[];

  @OneToMany(() => RecargoPrestamo, (recargo) => recargo.prestamo)
  recargos: RecargoPrestamo[];

  @OneToMany(() => Pago, (pago) => pago.prestamo)
  pagos: Pago[];
}
