import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Departamento } from '../../departamento/entities/departamento.entity';
import { Distrito } from '../../distrito/entities/distrito.entity';

@Entity('municipio')
export class Municipio {
  @PrimaryGeneratedColumn({ name: 'idMunicipio' })
  id: number;

  @Column({ name: 'nombreMunicipio', length: 100 })
  nombre: string;

  @ManyToOne(() => Departamento, (departamento) => departamento.municipios)
  @JoinColumn({ name: 'idDepartamento' })
  departamento: Departamento;

  @Column({ name: 'idDepartamento' })
  departamentoId: number;

  @OneToMany(() => Distrito, (distrito) => distrito.municipio)
  distritos: Distrito[];
}
