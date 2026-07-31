import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tipo_accion')
export class TipoAccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nombre: string;

  @Column('decimal', { precision: 8, scale: 4, default: 0 })
  tasaInteres: number;

  @Column('decimal', {
    precision: 14,
    scale: 2,
    default: 0,
    comment: 'Valor en dólares de cada acción',
  })
  valorUnitario: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
