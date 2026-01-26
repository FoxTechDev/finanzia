import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';
import { EstadoGarantia } from '../enums/tipo-garantia.enum';
import { TipoGarantiaCatalogo } from './tipo-garantia-catalogo.entity';
import { GarantiaHipotecaria } from './garantia-hipotecaria.entity';
import { GarantiaPrendaria } from './garantia-prendaria.entity';
import { GarantiaFiador } from './garantia-fiador.entity';
import { GarantiaDocumentaria } from './garantia-documentaria.entity';

@Entity('garantia')
export class Garantia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  solicitudId: number;

  @ManyToOne(() => Solicitud, (solicitud) => solicitud.garantias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'solicitudId' })
  solicitud: Solicitud;

  @Column()
  tipoGarantiaId: number;

  @ManyToOne(() => TipoGarantiaCatalogo, (tipo) => tipo.garantias, {
    eager: true,
  })
  @JoinColumn({ name: 'tipoGarantiaId' })
  tipoGarantiaCatalogo: TipoGarantiaCatalogo;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  valorEstimado: number;

  @Column({
    type: 'enum',
    enum: EstadoGarantia,
    default: EstadoGarantia.PENDIENTE,
  })
  estado: EstadoGarantia;

  @Column({ type: 'date', nullable: true })
  fechaConstitucion: Date;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: Date;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones con tablas de detalle
  @OneToOne(() => GarantiaHipotecaria, (hipotecaria) => hipotecaria.garantia, {
    cascade: true,
    eager: true,
  })
  hipotecaria: GarantiaHipotecaria;

  @OneToOne(() => GarantiaPrendaria, (prendaria) => prendaria.garantia, {
    cascade: true,
    eager: true,
  })
  prendaria: GarantiaPrendaria;

  @OneToOne(() => GarantiaFiador, (fiador) => fiador.garantia, {
    cascade: true,
    eager: true,
  })
  fiador: GarantiaFiador;

  @OneToOne(() => GarantiaDocumentaria, (documentaria) => documentaria.garantia, {
    cascade: true,
    eager: true,
  })
  documentaria: GarantiaDocumentaria;
}
