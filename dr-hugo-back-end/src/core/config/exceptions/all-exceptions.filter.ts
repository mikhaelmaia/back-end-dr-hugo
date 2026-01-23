import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ExceptionResponse } from './exception-response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const response = ExceptionResponse.from(exception, ctx);

    this.logException(exception, response);

    httpAdapter.reply(ctx.getResponse(), response, response.status);
  }

  private logException(exception: unknown, response: ExceptionResponse): void {
    if (exception instanceof Error) {
      this.logger.error(
        `${response.method} ${response.path} → ${response.status}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `${response.method} ${response.path} → ${response.status}`,
        JSON.stringify(exception),
      );
    }
  }
}