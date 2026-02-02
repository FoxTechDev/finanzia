import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { Direccion } from '../../direccion/entities/direccion.entity';
import { ActividadEconomica } from '../../actividad-economica/entities/actividad-economica.entity';
import { ReferenciaPersonal } from '../../referencia-personal/entities/referencia-personal.entity';
import { ReferenciaFamiliar } from '../../referencia-familiar/entities/referencia-familiar.entity';
import { DependenciaFamiliar } from '../../dependencia-familiar/entities/dependencia-familiar.entity';
import { GastoCliente } from '../../gasto-cliente/entities/gasto-cliente.entity';
import { IngresoCliente } from '../../ingreso-cliente/entities/ingreso-cliente.entity';

export enum Sexo {
  MASCULINO = 'Masculino',
  FEMENINO = 'Femenino',
  OTRO = 'Otro',
}

@Entity('persona')
@Index(['numeroDui']) // Fast lookup by DUI (already unique but good for searches)
@Index(['nombre', 'apellido']) // Search by name
@Index(['correoElectronico']) // Lookup by email
@Index(['telefono']) // Lookup by phone
export class Persona {
  @PrimaryGeneratedColumn({ name: 'idPersona' })
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ name: 'fechaNacimiento', type: 'date' })
  fechaNacimiento: Date;

  @Column({
    type: 'enum',
    enum: Sexo,
    nullable: true,
  })
  sexo: Sexo;

  @Column({ length: 60 })
  nacionalidad: string;

  @Column({ name: 'estadoCivil', length: 30, nullable: true })
  estadoCivil: string;

  @Column({ length: 30, nullable: true })
  telefono: string;

  @Column({ name: 'correoElectronico', length: 120, nullable: true })
  correoElectronico: string;

  @Column({ name: 'numeroDui', length: 10, unique: true })
  numeroDui: string;

  @Column({ name: 'fechaEmisionDui', type: 'date' })
  fechaEmisionDui: Date;

  @Column({ name: 'lugarEmisionDui', length: 120 })
  lugarEmisionDui: string;

  @OneToOne(() => Direccion, (direccion) => direccion.persona, { cascade: true })
  direccion: Direccion;

  @OneToOne(() => ActividadEconomica, (actividad) => actividad.persona, { cascade: true })
  actividadEconomica: ActividadEconomica;

  @OneToMany(() => ReferenciaPersonal, (ref) => ref.persona, { cascade: true })
  referenciasPersonales: ReferenciaPersonal[];

  @OneToMany(() => ReferenciaFamiliar, (ref) => ref.persona, { cascade: true })
  referenciasFamiliares: ReferenciaFamiliar[];

  @OneToMany(() => DependenciaFamiliar, (dep) => dep.persona, { cascade: true })
  dependenciasFamiliares: DependenciaFamiliar[];

  @OneToMany(() => GastoCliente, (gasto) => gasto.persona, { cascade: true })
  gastos: GastoCliente[];

  @OneToMany(() => IngresoCliente, (ingreso) => ingreso.persona, { cascade: true })
  ingresos: IngresoCliente[];
}
