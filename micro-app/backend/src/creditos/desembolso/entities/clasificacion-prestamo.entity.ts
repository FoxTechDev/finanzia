import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Clasificación de préstamos según normativa NCB-022 de El Salvador
 * Categorías de riesgo crediticio para provisión
 */
@Entity('clasificacion_prestamo')
export class ClasificacionPrestamo {
  @PrimaryGeneratedColumn()
  id: number;

  // Código de la categoría (A, B, C, D, E)
  @Column({ length: 10, unique: true })
  codigo: string;

  // Nombre de la categoría
  @Column({ length: 100 })
  nombre: string;

  // Descripción detallada
  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  // Rango de días de mora (opcional, usado por el seeder con valores por defecto)
  @Column({ type: 'int', default: 0, nullable: true })
  diasMoraMinimo: number;

  @Column({ type: 'int', nullable: true })
  diasMoraMaximo: number | null;

  // Porcentaje de provisión requerida (0-100) (opcional, usado por el seeder)
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0 })
  porcentajeProvision: number;

  // Indica si la clasificación está activa
  @Column({ default: true })
  activo: boolean;

  // Orden de visualización
  @Column({ default: 0 })
  orden: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
