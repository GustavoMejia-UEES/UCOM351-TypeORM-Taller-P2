import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from './entities/album.entity.js';

@Injectable()
export class AlbumesService {
  constructor(
    @InjectRepository(Album)
    private readonly albumesRepo: Repository<Album>,
  ) {}

  findAll(): Promise<Album[]> {
    return this.albumesRepo.find({
      relations: { fotos: { etiquetas: true } },
      order: { id: 'ASC' },
    });
  }

  async findFotos(id: number): Promise<Album> {
    const album = await this.albumesRepo.findOne({
      where: { id },
      relations: { fotos: true },
    });
    if (!album) {
      throw new NotFoundException(`Album ${id} no encontrado`);
    }
    return album;
  }

  async findOne(id: number): Promise<Album> {
    const album = await this.albumesRepo.findOne({
      where: { id },
      relations: { fotos: { etiquetas: true } },
    });
    if (!album) {
      throw new NotFoundException(`Album ${id} no encontrado`);
    }
    return album;
  }

  create(datos: Partial<Album>): Promise<Album> {
    return this.albumesRepo.save(this.albumesRepo.create(datos));
  }

  async update(id: number, datos: Partial<Album>): Promise<Album> {
    const album = await this.findOne(id);
    this.albumesRepo.merge(album, datos);
    return this.albumesRepo.save(album);
  }

  async remove(id: number): Promise<Album> {
    const album = await this.findOne(id);
    const albumEliminado = { ...album };
    await this.albumesRepo.remove(album);
    return albumEliminado;
  }
}
