import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { QueryFailedError } from 'typeorm';

type PostgresError = QueryFailedError & {
  code?: string;
  detail?: string;
  driverError?: { code?: string; detail?: string };
};

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(error: PostgresError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const codigo = error.driverError?.code ?? error.code ?? '';
    const detalle = error.driverError?.detail ?? error.detail;
    const errores: Record<string, [number, string]> = {
      '23505': [HttpStatus.CONFLICT, 'El registro ya existe'],
      '23503': [HttpStatus.BAD_REQUEST, 'Referencia a un registro inexistente'],
    };
    const [statusCode, message] = errores[codigo] ?? [
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Error en la base de datos',
    ];

    response.status(statusCode).json({ statusCode, message, detalle });
  }
}
