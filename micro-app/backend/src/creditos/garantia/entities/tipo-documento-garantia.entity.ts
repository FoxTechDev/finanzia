import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GarantiaDocumentaria } from './garantia-documentaria.entity';

@Entity('tipo_documento_garantia')
export class TipoDocumentoGarantia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  codigo: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => GarantiaDocumentaria, (gd) => gd.tipoDocumentoEntity)
  garantiasDocumentarias: GarantiaDocumentaria[];
}
