import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LineaAhorro } from '../../linea-ahorro/entities/linea-ahorro.entity';

@Entity('tipo_ahorro')
export class TipoAhorro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lineaAhorroId: number;

  @ManyToOne(() => LineaAhorro, (linea) => linea.tiposAhorro)
  @JoinColumn({ name: 'lineaAhorroId' })
  lineaAhorro: LineaAhorro;

  @Column({ length: 50 })
  nombre: string;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @Column({ default: false })
  esPlazo: boolean;

  @Column('decimal', { precision: 8, scale: 4, default: 0 })
  tasaMin: number;

  @Column('decimal', { precision: 8, scale: 4, default: 0 })
  tasaMax: number;

  @Column('decimal', { precision: 8, scale: 4, default: 0 })
  tasaVigente: number;

  @Column({ default: 0 })
  plazo: number;

  @Column({ default: 0 })
  plazoMin: number;

  @Column({ default: 0 })
  plazoMax: number;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  montoAperturaMin: number;

  @Column({ default: 0 })
  diasGracia: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
