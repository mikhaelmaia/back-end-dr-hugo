import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ExceptionResponse } from './exception-response';
import { ApplicationResponse } from 'src/core/vo/types/types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const exceptionResponse = ExceptionResponse.from(exception, ctx);
    
    const responseData: ApplicationResponse<ExceptionResponse> = {
      statusCode: exceptionResponse.status,
      data: exceptionResponse,
      message: exceptionResponse.name,
    };

    this.logException(exception, exceptionResponse);

    httpAdapter.reply(ctx.getResponse(), responseData, exceptionResponse.status);
  }

  private logException(exception: unknown, exceptionResponse: ExceptionResponse): void {
    if (exception instanceof Error) {
      this.logger.error(
        `${exceptionResponse.method} ${exceptionResponse.path} → ${exceptionResponse.status}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `${exceptionResponse.method} ${exceptionResponse.path} → ${exceptionResponse.status}`,
        JSON.stringify(exception),
      );
    }
  }
}