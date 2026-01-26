import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Garantia } from './garantia.entity';
import { TipoInmueble } from './tipo-inmueble.entity';
import { Departamento } from '../../../departamento/entities/departamento.entity';
import { Municipio } from '../../../municipio/entities/municipio.entity';
import { Distrito } from '../../../distrito/entities/distrito.entity';

@Entity('garantia_hipotecaria')
export class GarantiaHipotecaria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  garantiaId: number;

  @OneToOne(() => Garantia, (garantia) => garantia.hipotecaria, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'garantiaId' })
  garantia: Garantia;

  @Column()
  tipoInmuebleId: number;

  @ManyToOne(() => TipoInmueble, (tipo) => tipo.garantiasHipotecarias, {
    eager: true,
  })
  @JoinColumn({ name: 'tipoInmuebleId' })
  tipoInmuebleEntity: TipoInmueble;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  // Ubicación geográfica
  @Column({ nullable: true })
  departamentoId: number;

  @ManyToOne(() => Departamento)
  @JoinColumn({ name: 'departamentoId', referencedColumnName: 'id' })
  departamento: Departamento;

  @Column({ nullable: true })
  municipioId: number;

  @ManyToOne(() => Municipio)
  @JoinColumn({ name: 'municipioId', referencedColumnName: 'id' })
  municipio: Municipio;

  @Column({ nullable: true })
  distritoId: number;

  @ManyToOne(() => Distrito)
  @JoinColumn({ name: 'distritoId', referencedColumnName: 'id' })
  distrito: Distrito;

  // Datos del Centro Nacional de Registros (CNR)
  @Column({ type: 'varchar', length: 50, nullable: true })
  numeroRegistro: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  folioRegistro: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  libroRegistro: string;

  // Áreas
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  areaTerreno: number; // en metros cuadrados

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  areaConstruccion: number; // en metros cuadrados

  // Avalúo pericial
  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  valorPericial: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  nombrePerito: string;

  @Column({ type: 'date', nullable: true })
  fechaAvaluo: Date;
}
