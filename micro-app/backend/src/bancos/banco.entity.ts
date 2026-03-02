import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('banco')
export class Banco {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, unique: true })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
