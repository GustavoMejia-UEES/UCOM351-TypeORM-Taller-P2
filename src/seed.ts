import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module.js';
import { Album } from './albumes/entities/album.entity.js';
import { Etiqueta } from './fotos/entities/etiqueta.entity.js';
import { Foto } from './fotos/entities/foto.entity.js';

const alAzar = <T>(elementos: T[]): T =>
  elementos[Math.floor(Math.random() * elementos.length)]!;

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const db = app.get(DataSource);
    const albumesRepo = db.getRepository(Album);
    const etiquetasRepo = db.getRepository(Etiqueta);
    const fotosRepo = db.getRepository(Foto);

    await db.query(
      'TRUNCATE TABLE fotos_etiquetas, fotos, etiquetas, albumes RESTART IDENTITY CASCADE',
    );

    const albumes = await albumesRepo.save(
      ['Viajes', 'Guayaquil', 'Naturaleza'].map((nombre) =>
        albumesRepo.create({ nombre }),
      ),
    );

    const etiquetas = await etiquetasRepo.save(
      ['playa', 'ciudad', 'noche', 'cielo', 'montaña', 'rio'].map((nombre) =>
        etiquetasRepo.create({ nombre }),
      ),
    );

    const fotos = Array.from({ length: 20 }, (_, indice) => {
      const album = alAzar(albumes);
      const cantidadEtiquetas = Math.floor(Math.random() * 3) + 1;
      const etiquetasDeFoto = [
        ...new Set(
          Array.from({ length: cantidadEtiquetas }, () => alAzar(etiquetas)),
        ),
      ];

      return fotosRepo.create({
        titulo: `Foto ${indice + 1}`,
        descripcion: `Foto de prueba para el álbum ${album.nombre}.`,
        calificacion: Math.round(Math.random() * 50) / 10,
        ruta: `https://picsum.photos/id/${(indice + 1) * 10}/600/400`,
        album,
        etiquetas: etiquetasDeFoto,
      });
    });

    await fotosRepo.save(fotos);

    console.log(
      `Seed completo: ${albumes.length} álbumes, ${etiquetas.length} etiquetas y ${fotos.length} fotos insertadas.`,
    );
  } finally {
    await app.close();
  }
}

seed().catch((error: unknown) => {
  console.error('No se pudo ejecutar el seed:', error);
  process.exitCode = 1;
});
