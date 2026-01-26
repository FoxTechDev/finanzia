import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Prestamo } from './prestamo.entity';
import { TipoRecargo } from './tipo-recargo.entity';
import { TipoCalculo } from './tipo-deduccion.entity';

@Entity('recargo_prestamo')
export class RecargoPrestamo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prestamoId: number;

  @ManyToOne(() => Prestamo, (prestamo) => prestamo.recargos)
  @JoinColumn({ name: 'prestamoId' })
  prestamo: Prestamo;

  @Column({ nullable: true })
  tipoRecargoId: number;

  @ManyToOne(() => TipoRecargo)
  @JoinColumn({ name: 'tipoRecargoId' })
  tipoRecargo: TipoRecargo;

  @Column({ length: 100 })
  nombre: string;

  @Column({
    type: 'enum',
    enum: TipoCalculo,
    default: TipoCalculo.FIJO,
  })
  tipoCalculo: TipoCalculo;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  valor: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  montoCalculado: number;

  @Column({ default: 1 })
  aplicaDesde: number;

  @Column({ nullable: true })
  aplicaHasta: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
