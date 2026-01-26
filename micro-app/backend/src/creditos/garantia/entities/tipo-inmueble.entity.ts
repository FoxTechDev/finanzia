import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GarantiaHipotecaria } from './garantia-hipotecaria.entity';

@Entity('tipo_inmueble')
export class TipoInmueble {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => GarantiaHipotecaria, (gh) => gh.tipoInmuebleEntity)
  garantiasHipotecarias: GarantiaHipotecaria[];
}
