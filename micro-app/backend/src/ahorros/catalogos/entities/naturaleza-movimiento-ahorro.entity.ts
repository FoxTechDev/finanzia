import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('naturaleza_movimiento_ahorro')
export class NaturalezaMovimientoAhorro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, unique: true })
  codigo: string;

  @Column({ length: 50 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
