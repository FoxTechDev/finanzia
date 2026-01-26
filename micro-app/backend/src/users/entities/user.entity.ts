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
import { Rol } from '../../catalogos/rol/entities/rol.entity';

@Entity('users')
@Index(['email']) // Index for email lookups (login, registration)
@Index(['rolId']) // Index for role-based queries
@Index(['isActive']) // Index for filtering active users
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  rolId: number;

  @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: false })
  @JoinColumn({ name: 'rolId' })
  rol: Rol;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
