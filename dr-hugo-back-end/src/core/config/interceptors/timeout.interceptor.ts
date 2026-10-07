import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  catchError,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import {
  DEFAULT_REQUEST_TIMEOUT_MS,
  REQUEST_TIMEOUT_KEY,
} from 'src/core/vo/decorators/request-timeout.decorator';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const limit =
      this.reflector.getAllAndOverride<number>(REQUEST_TIMEOUT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? DEFAULT_REQUEST_TIMEOUT_MS;

    return next.handle().pipe(
      timeout(limit),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () => new BadRequestException('Tempo de consulta expirado'),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
