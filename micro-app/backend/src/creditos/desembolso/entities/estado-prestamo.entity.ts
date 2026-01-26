import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Catálogo de estados del préstamo
 * Define los diferentes estados en el ciclo de vida de un préstamo
 */
@Entity('estado_prestamo')
export class EstadoPrestamo {
  @PrimaryGeneratedColumn()
  id: number;

  // Código del estado (ACTIVO, CANCELADO, ANULADO)
  @Column({ length: 20, unique: true })
  codigo: string;

  // Nombre descriptivo del estado
  @Column({ length: 100 })
  nombre: string;

  // Descripción del estado
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  // Indica si el estado está activo para uso
  @Column({ default: true })
  activo: boolean;

  // Orden de visualización
  @Column({ default: 0 })
  orden: number;

  // Color para UI (hexadecimal)
  @Column({ length: 7, nullable: true })
  color: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
