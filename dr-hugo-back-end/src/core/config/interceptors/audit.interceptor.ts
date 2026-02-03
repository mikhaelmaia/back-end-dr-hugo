import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import {
  Observable,
  defer,
  from,
  mergeMap,
  catchError,
  throwError,
} from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../../modules/audit/audit.service';
import {
  AuditableOptions,
  AUDITABLE_METADATA_KEY,
} from '../../vo/decorators/auditable.decorator';
import { CreateAuditDto } from '../../modules/audit/dtos/create-audit.dto';
import { AuditDataPayload } from '../../modules/audit/types/audit.types';
import { ClientFingerprintDto } from '../../modules/audit/fingerprint/dtos/client-fingerprint.dto';
import { HttpHeaders } from '../../vo/consts/enums';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const auditOptions = this.reflector.getAllAndOverride<AuditableOptions>(
      AUDITABLE_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { method, url, params, body, route } = request;
    const auditDataPayload = this.extractAuditDataPayload(request);

    return next.handle().pipe(
      mergeMap((result) =>
        defer(() => {
          if (auditOptions.auditOnSuccessOnly !== false) {
            this.processAudit(
              auditOptions,
              { method, url, params, body, result, route },
              auditDataPayload,
            );
          }
          return from([result]);
        }),
      ),
      catchError((error) => {
        if (auditOptions.auditOnSuccessOnly === false) {
          this.processAudit(
            auditOptions,
            { method, url, params, body, result: null, route, error },
            auditDataPayload,
          );
        }
        return throwError(() => error);
      }),
    );
  }

  private extractAuditDataPayload(request: any): AuditDataPayload {
    const forwardedFor = request.headers[HttpHeaders.ForwardFor];
    const ip =
      request.ip ||
      (typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : '') ||
      request.socket?.remoteAddress ||
      '';

    return {
      ip,
      userAgent: request.headers[HttpHeaders.UserAgent] ?? '',
      sessionId: request.headers[HttpHeaders.SessionId] ?? '',
      fingerprint:
        request.headers[HttpHeaders.ClientFingerprint] ??
        new ClientFingerprintDto(),
      author: request.currentUser,
    };
  }

  private processAudit(
    options: AuditableOptions,
    requestContext: {
      method: string;
      url: string;
      params: any;
      body: any;
      result: any;
      route: any;
      error?: any;
    },
    auditDataPayload: AuditDataPayload,
  ): void {
    try {
      const { params, body, result, route, error } = requestContext;

      const entityName =
        options.entityName || this.extractEntityNameFromRoute(route);

      const entityId = options.entityIdExtractor
        ? options.entityIdExtractor({ params, body, result })
        : this.defaultEntityIdExtractor({ params, body, result });

      const auditData = options.dataExtractor
        ? options.dataExtractor({ params, body, result })
        : this.defaultDataExtractor(
            { params, body, result, error },
            options.includeSensitiveData,
          );

      const dto: CreateAuditDto = {
        eventType: options.eventType,
        entityName,
        entityId: entityId ?? null,
        data: auditData,
      };

      this.auditService.process(dto, auditDataPayload).catch((err) => {
        this.logger.error('Erro ao processar auditoria', err);
      });
    } catch (err) {
      this.logger.error('Falha ao montar auditoria', err);
    }
  }

  private extractEntityNameFromRoute(route: any): string {
    if (!route?.path) return 'unknown';

    const segments = route.path
      .split('/')
      .find(
        (segment: string) =>
          segment && !segment.startsWith(':') && segment !== 'api',
      );

    return segments[0] || 'unknown';
  }

  private defaultEntityIdExtractor(context: {
    params?: any;
    body?: any;
    result?: any;
  }): string | null {
    const { params, body, result } = context;

    return (
      params?.id ||
      params?.userId ||
      params?.patientId ||
      result?.id ||
      body?.id ||
      null
    );
  }

  private defaultDataExtractor(
    context: {
      params?: any;
      body?: any;
      result?: any;
      error?: any;
    },
    includeSensitiveData = false,
  ): any {
    const data: any = { params: context.params ?? {} };

    if (context.body) {
      data.body = includeSensitiveData
        ? context.body
        : this.sanitizeSensitiveData(context.body);
    }

    if (context.result) {
      data.result = includeSensitiveData
        ? context.result
        : this.sanitizeSensitiveData(context.result);
    }

    if (context.error) {
      data.error = {
        message: context.error.message,
        name: context.error.name,
        status: context.error.status ?? context.error.statusCode,
      };
    }

    return data;
  }

  private sanitizeSensitiveData(
    obj: any,
    seen: WeakSet<object> = new WeakSet(),
  ): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (seen.has(obj)) return obj;

    seen.add(obj);

    const sensitiveFields = new Set([
      'password',
      'senha',
      'token',
      'secret',
      'key',
      'apiKey',
      'accessToken',
      'refreshToken',
      'authorization',
      'auth',
    ]);

    const sanitized: any = Array.isArray(obj) ? [] : { ...obj };

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.has(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeSensitiveData(value, seen);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
