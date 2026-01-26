import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  codigo: string;

  @Column({ length: 50 })
  nombre: string;

  @Column({ nullable: true, length: 255 })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ default: 0 })
  orden: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.rol)
  usuarios: User[];
}
