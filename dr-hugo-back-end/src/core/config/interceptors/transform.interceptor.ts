import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getDescriptionFromStatusCode } from 'src/core/utils/http.utils';
import { ApplicationResponse } from 'src/core/vo/types/types';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApplicationResponse<T>>
{
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApplicationResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const statusCode = context.switchToHttp().getResponse().statusCode;
        return {
          statusCode,
          data,
          message: getDescriptionFromStatusCode(statusCode),
        };
      }),
    );
  }
}
