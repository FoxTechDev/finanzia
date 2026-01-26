import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Garantia } from './garantia.entity';
import { Persona } from '../../../persona/entities/persona.entity';

@Entity('garantia_fiador')
export class GarantiaFiador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  garantiaId: number;

  @OneToOne(() => Garantia, (garantia) => garantia.fiador, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'garantiaId' })
  garantia: Garantia;

  @Column()
  personaFiadorId: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'personaFiadorId' })
  personaFiador: Persona;

  @Column({ type: 'varchar', length: 50, nullable: true })
  parentesco: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ocupacion: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  ingresoMensual: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  lugarTrabajo: string;

  @Column({ type: 'text', nullable: true })
  direccionLaboral: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefonoLaboral: string;
}
