import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { FotosModule } from './fotos/fotos.module.js';
import { AlbumesModule } from './albumes/albumes.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '5433')),
        username: config.get<string>('DB_USER', 'album_user'),
        password: config.get<string>('DB_PASSWORD', 'album_local'),
        database: config.get<string>('DB_NAME', 'album'),
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
      }),
    }),
    FotosModule,
    AlbumesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
