import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Foto } from './foto.entity.js';

@Entity('etiquetas')
export class Etiqueta {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 60, unique: true })
  nombre!: string;

  @ManyToMany(() => Foto, (foto) => foto.etiquetas)
  fotos!: Foto[];
}
