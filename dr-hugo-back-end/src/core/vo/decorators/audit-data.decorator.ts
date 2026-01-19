import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuditDataPayload } from 'src/core/modules/audit/types/audit.types';
import { UserDto } from 'src/modules/users/dtos/user.dto';
import { HttpHeaders } from '../consts/enums';

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
    const fingerprint = request.headers[HttpHeaders.ClientFingerprint] ?? '';
    const author = request.currentUser as UserDto;

    return {
      ip,
      userAgent,
      sessionId,
      fingerprint,
      author,
    };
  },
);
