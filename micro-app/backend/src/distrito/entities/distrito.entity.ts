import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Municipio } from '../../municipio/entities/municipio.entity';

@Entity('distrito')
export class Distrito {
  @PrimaryGeneratedColumn({ name: 'idDistrito' })
  id: number;

  @Column({ name: 'nombreDistrito', length: 100 })
  nombre: string;

  @ManyToOne(() => Municipio, (municipio) => municipio.distritos)
  @JoinColumn({ name: 'idMunicipio' })
  municipio: Municipio;

  @Column({ name: 'idMunicipio' })
  municipioId: number;
}
