import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { FotosService } from './fotos.service.js';
import { Foto } from './entities/foto.entity.js';

@Controller('fotos')
export class FotosController {
  constructor(private readonly fotosService: FotosService) {}

  @Get()
  findAll() {
    return this.fotosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fotosService.findOne(id);
  }

  @Post()
  create(@Body() datos: Partial<Foto>) {
    return this.fotosService.create(datos);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: Partial<Foto>,
  ) {
    return this.fotosService.update(id, datos);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fotosService.remove(id);
  }
}
