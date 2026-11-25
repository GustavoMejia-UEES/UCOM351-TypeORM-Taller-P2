import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Album } from '../../albumes/entities/album.entity.js';
import { Etiqueta } from './etiqueta.entity.js';

@Entity('fotos')
export class Foto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'real', default: 0 })
  calificacion!: number;

  @Column({ type: 'text' })
  ruta!: string;

  @Column({ type: 'text', nullable: true })
  fotografo?: string;

  @ManyToOne(() => Album, (album) => album.fotos, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'albumId' })
  album?: Album | null;

  @ManyToMany(() => Etiqueta, (etiqueta) => etiqueta.fotos)
  @JoinTable({
    name: 'fotos_etiquetas',
    joinColumn: { name: 'foto_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'etiqueta_id', referencedColumnName: 'id' },
  })
  etiquetas!: Etiqueta[];

  @CreateDateColumn()
  creadoEn!: Date;

  @UpdateDateColumn()
  actualizadoEn!: Date;
}
