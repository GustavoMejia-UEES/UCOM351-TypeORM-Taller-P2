# Evidencias del Taller Parte 2

Rama: `taller-parte-2`, basada en el `main` publicado (`c56ed58`). Incluye los cambios de relaciones y filtros/paginación trabajados hoy, más el reto de filtrar por texto de etiqueta, ordenar por calificación y mostrar el álbum.

## Ejecución verificada

- `build-terminal.txt`: salida de `npm run build`.
- `seed-terminal.txt`: salida de `npm run seed` (3 álbumes, 6 etiquetas y 20 fotos).
- `api-terminal.txt`: comprobaciones HTTP de filtro combinado, búsqueda de etiqueta sin distinguir mayúsculas, orden ASC/DESC, relación con álbum y validación HTTP 400.
- `api-etiqueta-asc.json` y `api-etiqueta-desc.json`: respuestas JSON completas de la API.
- `postgres-terminal.txt`: conteos reales y uso de etiquetas consultados en PostgreSQL; cero relaciones huérfanas.
- `api-terminal.png` y `postgres-terminal.png`: imágenes generadas desde esas salidas verificables; el texto original queda junto a cada imagen.
- `taller-jueves/`: imágenes de las páginas del PDF que pertenece al commit publicado el jueves.

La asignación aleatoria de etiquetas del seed cambia en cada ejecución; los conteos de las evidencias representan la ejecución guardada en estos archivos.
