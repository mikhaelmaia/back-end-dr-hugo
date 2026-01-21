import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuditDataPayload } from 'src/core/modules/audit/types/audit.types';
import { HttpHeaders } from '../consts/enums';
import { ClientFingerprintDto } from 'src/core/modules/audit/fingerprint/dtos/client-fingerprint.dto';

export const AuditData = createParamDecorator(
  (ctx: ExecutionContext): AuditDataPayload => {
    const request = ctx.switchToHttp().getRequest();

    const forwardedFor = request.headers[HttpHeaders.ForwardFor];
    const ip =
      request.ip ||
      (typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : '') ||
      request.socket?.remoteAddress ||
      '';

    const userAgent = request.headers[HttpHeaders.UserAgent] ?? '';
    const sessionId = request.headers[HttpHeaders.SessionId] ?? '';
    const fingerprint =
      request.headers[HttpHeaders.ClientFingerprint] ??
      new ClientFingerprintDto();
    const author = request.currentUser;

    return {
      ip,
      userAgent,
      sessionId,
      fingerprint,
      author,
    };
  },
);
