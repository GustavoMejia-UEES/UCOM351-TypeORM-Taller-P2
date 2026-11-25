import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
import { Foto } from './entities/foto.entity.js';

export interface FiltroFotos {
  min: number;
  max: number;
  q?: string;
  etiqueta?: string;
  orden?: string;
  page: number;
  limit: number;
}

export interface FotosPage {
  data: Foto[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class FotosService {
  constructor(
    @InjectRepository(Foto)
    private readonly fotosRepo: Repository<Foto>,
  ) {}

  async findAll(filtros: FiltroFotos): Promise<FotosPage> {
    const { min, max, page, limit } = filtros;
    if (min > max) {
      throw new BadRequestException('min no puede ser mayor que max');
    }
    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('page debe ser un entero mayor que 0');
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException('limit debe estar entre 1 y 100');
    }

    const ordenSolicitado = (filtros.orden ?? 'DESC').toUpperCase();
    if (ordenSolicitado !== 'ASC' && ordenSolicitado !== 'DESC') {
      throw new BadRequestException('orden debe ser ASC o DESC');
    }
    const ordenCalificacion: 'ASC' | 'DESC' = ordenSolicitado;

    const rangoCalificacion = Between(min, max);
    const texto = filtros.q?.trim();
    const textoEtiqueta = filtros.etiqueta?.trim();

    const [data, total] = await this.fotosRepo.findAndCount({
      where: {
        calificacion: rangoCalificacion,
        ...(texto ? { titulo: ILike(`%${texto}%`) } : {}),
        ...(textoEtiqueta
          ? { etiquetas: { nombre: ILike(`%${textoEtiqueta}%`) } }
          : {}),
      },
      relations: { album: true, etiquetas: true },
      order: { calificacion: ordenCalificacion, id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Foto> {
    const foto = await this.fotosRepo.findOne({
      where: { id },
      relations: { album: true, etiquetas: true },
    });
    if (!foto) {
      throw new NotFoundException(`Foto ${id} no encontrada`);
    }
    return foto;
  }

  create(datos: Partial<Foto>): Promise<Foto> {
    const foto = this.fotosRepo.create(datos);
    return this.fotosRepo.save(foto);
  }

  async update(id: number, datos: Partial<Foto>): Promise<Foto> {
    const foto = await this.findOne(id);
    this.fotosRepo.merge(foto, datos);
    return this.fotosRepo.save(foto);
  }

  async remove(id: number): Promise<Foto> {
    const foto = await this.findOne(id);
    const fotoEliminada = { ...foto };
    await this.fotosRepo.remove(foto);
    return fotoEliminada;
  }
}
