import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Municipio } from '../../municipio/entities/municipio.entity';

@Entity('departamento')
export class Departamento {
  @PrimaryGeneratedColumn({ name: 'idDepartamento' })
  id: number;

  @Column({ name: 'nombreDepartamento', length: 100 })
  nombre: string;

  @OneToMany(() => Municipio, (municipio) => municipio.departamento)
  municipios: Municipio[];
}
