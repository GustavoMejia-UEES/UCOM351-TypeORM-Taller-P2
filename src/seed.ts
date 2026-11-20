import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { FotosService } from './fotos/fotos.service.js';
import { Foto } from './fotos/entities/foto.entity.js';

const fotosDePrueba: Partial<Foto>[] = [
  {
    titulo: 'Atardecer en el malecón',
    descripcion: 'Atardecer junto al río Guayas.',
    calificacion: 4.8,
    ruta: '/fotos/atardecer-malecon.jpg',
  },
  {
    titulo: 'Centro histórico',
    descripcion: 'Vista de una calle del centro histórico.',
    calificacion: 4.5,
    ruta: '/fotos/centro-historico.jpg',
  },
  {
    titulo: 'Playa al amanecer',
    descripcion: 'La playa al inicio de la mañana.',
    calificacion: 4.9,
    ruta: '/fotos/playa-amanecer.jpg',
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const fotosService = app.get(FotosService);
    const titulosExistentes = new Set(
      (await fotosService.findAll()).map((foto) => foto.titulo),
    );
    let insertadas = 0;

    for (const datos of fotosDePrueba) {
      if (!datos.titulo || titulosExistentes.has(datos.titulo)) continue;

      await fotosService.create(datos);
      titulosExistentes.add(datos.titulo);
      insertadas += 1;
    }

    console.log(`Seed terminado: ${insertadas} foto(s) insertada(s).`);
  } finally {
    await app.close();
  }
}

seed().catch((error: unknown) => {
  console.error('No se pudo ejecutar el seed:', error);
  process.exitCode = 1;
});
