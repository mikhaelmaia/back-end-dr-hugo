import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Reflector } from '@nestjs/core';

import { AuditService } from '../../modules/audit/audit.service';
import {
  AuditableOptions,
  AUDITABLE_METADATA_KEY,
  AuditMode,
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

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const options = this.reflector.getAllAndOverride<AuditableOptions>(
      AUDITABLE_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    this.logger.log(`Interceptor executado. Options encontradas: ${!!options}`);

    if (!options) {
      return next.handle();
    }

    this.logger.log(`Processando auditoria para: ${options.entityName} - ${options.eventType}`);

    const request = context.switchToHttp().getRequest();
    const requestSnapshot = this.extractRequestSnapshot(request);
    const payload = this.extractAuditPayload(request);

    const mode: AuditMode = options.mode ?? 'success';

    return next.handle().pipe(
      tap((result) => {
        if (mode === 'success' || mode === 'always') {
          this.processAudit(options, requestSnapshot, payload, result);
        }
      }),
      catchError((error) => {
        if (mode === 'error' || mode === 'always') {
          this.processAudit(options, requestSnapshot, payload, null, error);
        }
        return throwError(() => error);
      }),
    );
  }

  private processAudit(
    options: AuditableOptions,
    requestSnapshot: RequestSnapshot,
    payload: AuditDataPayload,
    result?: any,
    error?: any,
  ): void {
    this.logger.log(`Iniciando processamento de auditoria para ${options.entityName}`);
    try {
      const entityId = options.entityIdExtractor
        ? options.entityIdExtractor({
            params: requestSnapshot.params,
            body: requestSnapshot.body,
            result,
          })
        : this.defaultEntityIdExtractor({
            params: requestSnapshot.params,
            body: requestSnapshot.body,
            result,
          });

      const data = options.dataExtractor
        ? options.dataExtractor({
            params: requestSnapshot.params,
            body: requestSnapshot.body,
            result,
            error,
          })
        : this.defaultDataExtractor({
            params: requestSnapshot.params,
            body: requestSnapshot.body,
            result,
            error,
          });

      const dto: CreateAuditDto = {
        eventType: options.eventType,
        entityName: options.entityName,
        entityId,
        data,
      };

      this.logger.log(`Enviando para AuditService: ${JSON.stringify(dto)}`);
      this.auditService.process(dto, payload).catch((err) => {
        this.logger.error('Erro ao persistir auditoria', err);
      });
    } catch (err) {
      this.logger.error('Falha ao montar auditoria', err);
    }
  }

  private extractRequestSnapshot(request: any): RequestSnapshot {
    return {
      method: request.method,
      url: request.originalUrl ?? request.url,
      params: request.params,
      body: request.body,
      route: request.route?.path,
    };
  }

  private extractAuditPayload(request: any): AuditDataPayload {
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
      author: this.extractActor(request),
    };
  }

  private extractActor(request: any) {
    if (!request.currentUser) {
      return { type: 'system' };
    }

    return {
      type: 'user',
      id: request.currentUser.id,
      role: request.currentUser.role,
    };
  }

  private defaultEntityIdExtractor(context: {
    params?: any;
    body?: any;
    result?: any;
  }): string | null {
    return (
      context.params?.id ||
      context.params?.userId ||
      context.result?.id ||
      context.body?.id ||
      null
    );
  }

  private defaultDataExtractor(context: {
    params?: any;
    body?: any;
    result?: any;
    error?: any;
  }) {
    return {
      request: {
        params: context.params ?? {},
        body: this.sanitize(context.body),
      },
      response: context.result
        ? { result: this.sanitize(context.result) }
        : undefined,
      error: context.error
        ? {
            name: context.error.name,
            message: context.error.message,
            status:
              context.error.status ?? context.error.statusCode ?? undefined,
          }
        : undefined,
    };
  }

  private sanitize(obj: any, seen = new WeakSet<object>()): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (seen.has(obj)) return '[Circular]';

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
    ]);

    const output: any = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.has(key)) {
        output[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        output[key] = this.sanitize(value, seen);
      } else {
        output[key] = value;
      }
    }

    return output;
  }
}

interface RequestSnapshot {
  method: string;
  url: string;
  route?: string;
  params?: any;
  body?: any;
}
