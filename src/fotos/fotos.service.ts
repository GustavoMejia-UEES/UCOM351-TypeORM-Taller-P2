import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, In, Repository } from 'typeorm';
import { CreateFotoDto } from './dto/create-foto.dto.js';
import { UpdateFotoDto } from './dto/update-foto.dto.js';
import { QueryFotosDto } from './dto/query-fotos.dto.js';
import { Foto } from './entities/foto.entity.js';
import { Etiqueta } from './entities/etiqueta.entity.js';

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
    @InjectRepository(Etiqueta)
    private readonly etiquetasRepo: Repository<Etiqueta>,
  ) {}

  async findAll(filtros: QueryFotosDto): Promise<FotosPage> {
    const { min, max, page, limit, q, etiqueta } = filtros;
    if (min > max) {
      throw new BadRequestException('min no puede ser mayor que max');
    }
    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('page debe ser un entero mayor que 0');
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new BadRequestException('limit debe estar entre 1 y 50');
    }

    const ordenSolicitado = (filtros.orden ?? 'desc').toUpperCase();
    if (ordenSolicitado !== 'ASC' && ordenSolicitado !== 'DESC') {
      throw new BadRequestException('orden debe ser ASC o DESC');
    }
    const ordenCalificacion: 'ASC' | 'DESC' = ordenSolicitado;

    const rangoCalificacion = Between(min, max);
    const texto = q?.trim();
    const textoEtiqueta = etiqueta?.trim();

    const [data, total] = await this.fotosRepo.findAndCount({
      where: {
        calificacion: rangoCalificacion,
        ...(texto ? { titulo: ILike(`%${texto}%`) } : {}),
        ...(textoEtiqueta
          ? { etiquetas: { texto: ILike(`%${textoEtiqueta}%`) } }
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

  async create({ albumId, etiquetas, ...datos }: CreateFotoDto): Promise<Foto> {
    const foto = this.fotosRepo.create({
      ...datos,
      album: albumId ? { id: albumId } : null,
      etiquetas: await this.buscarOCrearEtiquetas(etiquetas),
    });
    const guardada = await this.fotosRepo.save(foto);
    return this.findOne(guardada.id);
  }

  async update(
    id: number,
    { albumId, etiquetas, ...datos }: UpdateFotoDto,
  ): Promise<Foto> {
    const foto = await this.findOne(id);
    Object.assign(foto, datos);
    if (albumId !== undefined) {
      foto.album = albumId === null ? null : ({ id: albumId } as Foto['album']);
    }
    if (etiquetas !== undefined) {
      foto.etiquetas = await this.buscarOCrearEtiquetas(etiquetas ?? []);
    }
    await this.fotosRepo.save(foto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const foto = await this.findOne(id);
    await this.fotosRepo.remove(foto);
  }

  private async buscarOCrearEtiquetas(
    textos?: string[] | null,
  ): Promise<Etiqueta[]> {
    const limpios = [
      ...new Set(
        (textos ?? [])
          .map((texto) => texto.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];
    if (limpios.length === 0) return [];

    const existentes = await this.etiquetasRepo.findBy({ texto: In(limpios) });
    const existentesSet = new Set(existentes.map((etiqueta) => etiqueta.texto));
    const nuevas = limpios
      .filter((texto) => !existentesSet.has(texto))
      .map((texto) => this.etiquetasRepo.create({ texto }));
    const guardadas = nuevas.length
      ? await this.etiquetasRepo.save(nuevas)
      : [];
    return [...existentes, ...guardadas];
  }
}
