import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import {
  catchError,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly FIVE_MINUTES: number = 30000;

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      timeout(this.FIVE_MINUTES),
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
