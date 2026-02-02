import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IngresoCliente } from '../../ingreso-cliente/entities/ingreso-cliente.entity';

@Entity('tipo_ingreso')
export class TipoIngreso {
  @PrimaryGeneratedColumn({ name: 'idTipoIngreso' })
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => IngresoCliente, (ingreso) => ingreso.tipoIngreso)
  ingresos: IngresoCliente[];
}
