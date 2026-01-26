import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Garantia } from './garantia.entity';
import { TipoDocumentoGarantia } from './tipo-documento-garantia.entity';

@Entity('garantia_documentaria')
export class GarantiaDocumentaria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  garantiaId: number;

  @OneToOne(() => Garantia, (garantia) => garantia.documentaria, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'garantiaId' })
  garantia: Garantia;

  @Column()
  tipoDocumentoId: number;

  @ManyToOne(() => TipoDocumentoGarantia, (tipo) => tipo.garantiasDocumentarias, {
    eager: true,
  })
  @JoinColumn({ name: 'tipoDocumentoId' })
  tipoDocumentoEntity: TipoDocumentoGarantia;

  @Column({ type: 'varchar', length: 50, nullable: true })
  numeroDocumento: string;

  @Column({ type: 'date', nullable: true })
  fechaEmision: Date;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  montoDocumento: number;
}
