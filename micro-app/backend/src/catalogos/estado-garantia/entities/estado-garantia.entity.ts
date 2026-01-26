import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Catálogo de estados de garantía
 * Define los diferentes estados en el ciclo de vida de una garantía
 */
@Entity('estado_garantia')
export class EstadoGarantia {
  @PrimaryGeneratedColumn()
  id: number;

  // Código del estado (PENDIENTE, CONSTITUIDA, LIBERADA, EJECUTADA)
  @Column({ length: 20, unique: true })
  codigo: string;

  // Nombre descriptivo del estado
  @Column({ length: 100 })
  nombre: string;

  // Descripción detallada del estado
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  // Indica si el estado está activo para uso
  @Column({ default: true })
  activo: boolean;

  // Orden de visualización en dropdowns
  @Column({ nullable: true })
  orden: number;

  // Color para UI (hexadecimal)
  @Column({ length: 7, nullable: true })
  color: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
