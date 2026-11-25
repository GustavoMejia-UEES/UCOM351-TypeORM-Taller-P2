import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AlbumesService } from './albumes.service.js';
import { Album } from './entities/album.entity.js';

@Controller('albumes')
export class AlbumesController {
  constructor(private readonly albumesService: AlbumesService) {}

  @Get()
  findAll() {
    return this.albumesService.findAll();
  }

  @Get(':id/fotos')
  findFotos(@Param('id', ParseIntPipe) id: number) {
    return this.albumesService.findFotos(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.albumesService.findOne(id);
  }

  @Post()
  create(@Body() datos: Partial<Album>) {
    return this.albumesService.create(datos);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: Partial<Album>,
  ) {
    return this.albumesService.update(id, datos);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.albumesService.remove(id);
  }
}
