import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Direccion } from '../../direccion/entities/direccion.entity';

@Entity('tipo_vivienda')
export class TipoVivienda {
  @PrimaryGeneratedColumn({ name: 'idTipoVivienda' })
  id: number;

  @Column({ length: 50, unique: true })
  codigo: string;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ nullable: true })
  orden: number;

  @OneToMany(() => Direccion, (direccion) => direccion.tipoVivienda)
  direcciones: Direccion[];
}
