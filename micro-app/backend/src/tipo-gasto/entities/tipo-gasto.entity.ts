import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { GastoCliente } from '../../gasto-cliente/entities/gasto-cliente.entity';

@Entity('tipo_gasto')
export class TipoGasto {
  @PrimaryGeneratedColumn({ name: 'idTipoGasto' })
  id: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => GastoCliente, (gasto) => gasto.tipoGasto)
  gastos: GastoCliente[];
}
