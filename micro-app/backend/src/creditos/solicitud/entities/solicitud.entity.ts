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
import { LineaCredito } from '../../linea-credito/entities/linea-credito.entity';
import { TipoCredito } from '../../tipo-credito/entities/tipo-credito.entity';
import { SolicitudHistorial } from './solicitud-historial.entity';
import { Garantia } from '../../garantia/entities/garantia.entity';
import { RecomendacionAsesor } from '../../garantia/enums/tipo-garantia.enum';
import { EstadoSolicitud } from '../../../catalogos/estado-solicitud/entities/estado-solicitud.entity';
import { PeriodicidadPago } from '../../../catalogos/periodicidad-pago/entities/periodicidad-pago.entity';
import { PlanPagoSolicitud } from './plan-pago-solicitud.entity';
import { RecargoSolicitud } from './recargo-solicitud.entity';

export enum TipoInteresSolicitud {
  FLAT = 'FLAT',
  AMORTIZADO = 'AMORTIZADO',
}

export enum DestinoCredito {
  CAPITAL_TRABAJO = 'CAPITAL_TRABAJO',
  ACTIVO_FIJO = 'ACTIVO_FIJO',
  CONSUMO_PERSONAL = 'CONSUMO_PERSONAL',
  VIVIENDA_NUEVA = 'VIVIENDA_NUEVA',
  VIVIENDA_USADA = 'VIVIENDA_USADA',
  MEJORA_VIVIENDA = 'MEJORA_VIVIENDA',
  CONSOLIDACION_DEUDAS = 'CONSOLIDACION_DEUDAS',
  EDUCACION = 'EDUCACION',
  SALUD = 'SALUD',
  VEHICULO = 'VEHICULO',
  OTRO = 'OTRO',
}

@Entity('solicitud')
@Index(['personaId']) // Fast lookup by customer
@Index(['numeroSolicitud']) // Fast lookup by application number
@Index(['estadoId']) // Filter by status
@Index(['lineaCreditoId']) // Reports by credit line
@Index(['tipoCreditoId']) // Reports by credit type
@Index(['personaId', 'estadoId']) // Composite for customer applications by status
@Index(['estadoId', 'fechaSolicitud']) // Pending applications by date
@Index(['fechaSolicitud']) // Date-based queries
@Index(['fechaDecisionComite']) // Committee decision reports
export class Solicitud {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  numeroSolicitud: string;

  // Relación con cliente
  @Column()
  personaId: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'personaId' })
  persona: Persona;

  // Relación con línea y tipo de crédito
  @Column()
  lineaCreditoId: number;

  @ManyToOne(() => LineaCredito)
  @JoinColumn({ name: 'lineaCreditoId' })
  lineaCredito: LineaCredito;

  @Column()
  tipoCreditoId: number;

  @ManyToOne(() => TipoCredito, (tipo) => tipo.solicitudes)
  @JoinColumn({ name: 'tipoCreditoId' })
  tipoCredito: TipoCredito;

  // Datos de la solicitud
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  montoSolicitado: number;

  @Column()
  plazoSolicitado: number; // en meses

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  tasaInteresPropuesta: number;

  @Column({
    type: 'enum',
    enum: DestinoCredito,
    default: DestinoCredito.CONSUMO_PERSONAL,
  })
  destinoCredito: DestinoCredito;

  @Column({ type: 'text', nullable: true })
  descripcionDestino: string;

  // Estado de la solicitud (relación con tabla de catálogo)
  @Column()
  estadoId: number;

  @ManyToOne(() => EstadoSolicitud, { eager: true })
  @JoinColumn({ name: 'estadoId' })
  estado: EstadoSolicitud;

  // Montos aprobados (pueden diferir de los solicitados)
  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  montoAprobado: number;

  @Column({ nullable: true })
  plazoAprobado: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  tasaInteresAprobada: number;

  // Fechas importantes
  @Column({ type: 'date' })
  fechaSolicitud: Date;

  @Column({ type: 'date', nullable: true })
  fechaAnalisis: Date;

  @Column({ type: 'date', nullable: true })
  fechaAprobacion: Date;

  @Column({ type: 'date', nullable: true })
  fechaDenegacion: Date;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: Date; // Fecha límite para desembolso

  // Analista y aprobador asignados
  @Column({ nullable: true })
  analistaId: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  nombreAnalista: string;

  @Column({ nullable: true })
  aprobadorId: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  nombreAprobador: string;

  // Observaciones y comentarios
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'text', nullable: true })
  motivoRechazo: string;

  // Scoring y evaluación (para futura implementación)
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  scoreCredito: number;

  // Clasificación de riesgo según NCB-022
  @Column({ length: 1, nullable: true })
  categoriaRiesgo: string; // A, B, C, D, E

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SolicitudHistorial, (historial) => historial.solicitud)
  historial: SolicitudHistorial[];

  // Relación con garantías
  @OneToMany(() => Garantia, (garantia) => garantia.solicitud)
  garantias: Garantia[];

  // Campos de análisis del asesor de negocio
  @Column({ type: 'text', nullable: true })
  analisisAsesor: string;

  @Column({
    type: 'enum',
    enum: RecomendacionAsesor,
    nullable: true,
  })
  recomendacionAsesor: RecomendacionAsesor;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  capacidadPago: number;

  @Column({ type: 'text', nullable: true })
  antecedentesCliente: string;

  // Campos para el Comité de Crédito
  @Column({ type: 'datetime', nullable: true })
  fechaTrasladoComite: Date;

  @Column({ type: 'datetime', nullable: true })
  fechaDecisionComite: Date;

  @Column({ type: 'text', nullable: true })
  observacionesComite: string;

  // Periodicidad de pago
  @Column({ nullable: true })
  periodicidadPagoId: number;

  @ManyToOne(() => PeriodicidadPago)
  @JoinColumn({ name: 'periodicidadPagoId' })
  periodicidadPago: PeriodicidadPago;

  // Tipo de interés para el plan de pago
  @Column({
    type: 'enum',
    enum: TipoInteresSolicitud,
    nullable: true,
  })
  tipoInteres: TipoInteresSolicitud;

  // Campos para pago diario
  @Column({ type: 'date', nullable: true })
  fechaDesdePago: Date;

  @Column({ type: 'date', nullable: true })
  fechaHastaPago: Date;

  @Column({ nullable: true })
  diasCalculados: number; // Días calculados excluyendo domingos

  // Relación con plan de pago de solicitud
  @OneToMany(() => PlanPagoSolicitud, (planPago) => planPago.solicitud)
  planPago: PlanPagoSolicitud[];

  // Relación con recargos de solicitud
  @OneToMany(() => RecargoSolicitud, (recargo) => recargo.solicitud)
  recargos: RecargoSolicitud[];
}
