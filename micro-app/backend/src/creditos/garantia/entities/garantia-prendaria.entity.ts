import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Garantia } from './garantia.entity';

@Entity('garantia_prendaria')
export class GarantiaPrendaria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  garantiaId: number;

  @OneToOne(() => Garantia, (garantia) => garantia.prendaria, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'garantiaId' })
  garantia: Garantia;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tipoBien: string; // Vehículo, Maquinaria, Equipo, etc.

  @Column({ type: 'text', nullable: true })
  descripcionBien: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marca: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modelo: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serie: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  placa: string; // Para vehículos

  @Column({ type: 'int', nullable: true })
  anio: number; // Año del bien

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  valorPericial: number;

  @Column({ type: 'text', nullable: true })
  ubicacionBien: string;
}
