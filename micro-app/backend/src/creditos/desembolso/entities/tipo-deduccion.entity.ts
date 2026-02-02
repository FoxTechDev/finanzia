import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoCalculo {
  FIJO = 'FIJO',
  PORCENTAJE = 'PORCENTAJE',
}

@Entity('tipo_deduccion')
export class TipoDeduccion {
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
    default: TipoCalculo.PORCENTAJE,
  })
  tipoCalculoDefault: TipoCalculo;

  @Column({ type: 'decimal', precision: 14, scale: 4, default: 0 })
  valorDefault: number;

  @Column({ default: true })
  activo: boolean;

  @Column({ default: false })
  cancelacionPrestamo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
