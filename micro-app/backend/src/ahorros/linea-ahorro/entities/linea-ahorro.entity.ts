import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TipoAhorro } from '../../tipo-ahorro/entities/tipo-ahorro.entity';

@Entity('linea_ahorro')
export class LineaAhorro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, unique: true })
  codigo: string;

  @Column({ length: 50 })
  nombre: string;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TipoAhorro, (tipo) => tipo.lineaAhorro)
  tiposAhorro: TipoAhorro[];
}
