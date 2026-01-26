import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Solicitud } from './solicitud.entity';

@Entity('solicitud_historial')
export class SolicitudHistorial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  solicitudId: number;

  @ManyToOne(() => Solicitud, (solicitud) => solicitud.historial)
  @JoinColumn({ name: 'solicitudId' })
  solicitud: Solicitud;

  @Column({ type: 'varchar', length: 50 })
  estadoAnterior: string; // Guardará el código del estado

  @Column({ type: 'varchar', length: 50 })
  estadoNuevo: string; // Guardará el código del estado

  @Column({ type: 'text', nullable: true })
  observacion: string;

  @Column({ nullable: true })
  usuarioId: number;

  @Column({ length: 150, nullable: true })
  nombreUsuario: string;

  @Column({ length: 50, nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  fechaCambio: Date;
}
