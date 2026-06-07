import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('forma_pago')
export class FormaPago {
  @PrimaryGeneratedColumn()
  idFormaPago: number;

  @Column({ length: 50, nullable: true })
  formaPago: string;
}
