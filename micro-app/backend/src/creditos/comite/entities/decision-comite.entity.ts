import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';

export enum TipoDecisionComite {
  AUTORIZADA = 'AUTORIZADA',
  DENEGADA = 'DENEGADA',
  OBSERVADA = 'OBSERVADA',
}

@Entity('decision_comite')
export class DecisionComite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  solicitudId: number;

  @ManyToOne(() => Solicitud)
  @JoinColumn({ name: 'solicitudId' })
  solicitud: Solicitud;

  @Column({
    type: 'enum',
    enum: TipoDecisionComite,
  })
  tipoDecision: TipoDecisionComite;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'text', nullable: true })
  condicionesEspeciales: string;

  // Montos autorizados (pueden diferir de lo solicitado)
  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  montoAutorizado: number;

  @Column({ nullable: true })
  plazoAutorizado: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  tasaAutorizada: number;

  // Auditoría
  @Column({ nullable: true })
  usuarioId: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  nombreUsuario: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaDecision: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
