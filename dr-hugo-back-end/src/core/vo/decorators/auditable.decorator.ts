import { SetMetadata } from '@nestjs/common';
import { AuditEventType } from '../consts/enums';

export interface AuditableOptions {
  eventType: AuditEventType;

  entityName?: string;

  entityIdExtractor?: (context: {
    params?: any;
    body?: any;
    result?: any;
  }) => string | null;

  dataExtractor?: (context: { params?: any; body?: any; result?: any }) => any;

  auditOnSuccessOnly?: boolean;

  includeSensitiveData?: boolean;
}

export const AUDITABLE_METADATA_KEY = 'auditable';

export const Auditable = (options: AuditableOptions) =>
  SetMetadata(AUDITABLE_METADATA_KEY, options);
