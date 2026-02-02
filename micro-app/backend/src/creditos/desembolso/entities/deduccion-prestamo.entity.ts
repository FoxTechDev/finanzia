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
import { Prestamo } from './prestamo.entity';
import { TipoDeduccion, TipoCalculo } from './tipo-deduccion.entity';

@Entity('deduccion_prestamo')
export class DeduccionPrestamo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prestamoId: number;

  @ManyToOne(() => Prestamo, (prestamo) => prestamo.deducciones)
  @JoinColumn({ name: 'prestamoId' })
  prestamo: Prestamo;

  @Column({ nullable: true })
  tipoDeduccionId: number;

  @ManyToOne(() => TipoDeduccion)
  @JoinColumn({ name: 'tipoDeduccionId' })
  tipoDeduccion: TipoDeduccion;

  @Column({ length: 100 })
  nombre: string;

  @Column({
    type: 'enum',
    enum: TipoCalculo,
    default: TipoCalculo.PORCENTAJE,
  })
  tipoCalculo: TipoCalculo;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  valor: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  montoCalculado: number;

  // Referencia al préstamo que se cancela (para refinanciamiento)
  @Column({ nullable: true })
  @Index('IDX_deduccion_prestamo_cancelar')
  prestamoACancelarId: number;

  @ManyToOne(() => Prestamo, { nullable: true })
  @JoinColumn({ name: 'prestamoACancelarId' })
  prestamoACancelar: Prestamo;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
