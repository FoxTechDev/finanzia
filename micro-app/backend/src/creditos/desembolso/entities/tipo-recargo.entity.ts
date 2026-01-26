import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TipoCalculo } from './tipo-deduccion.entity';

@Entity('tipo_recargo')
export class TipoRecargo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: TipoCalculo,
    default: TipoCalculo.FIJO,
  })
  tipoCalculoDefault: TipoCalculo;

  @Column({ type: 'decimal', precision: 14, scale: 4, default: 0 })
  valorDefault: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
