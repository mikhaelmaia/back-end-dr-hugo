import { SetMetadata } from '@nestjs/common';
import { AuditEventType } from '../consts/enums';

export type AuditMode = 'success' | 'error' | 'always';

export interface AuditableOptions {
  eventType: AuditEventType;

  entityName: string;

  mode?: AuditMode;

  entityIdExtractor?: (context: {
    params?: any;
    body?: any;
    result?: any;
  }) => string | null;

  dataExtractor?: (context: {
    params?: any;
    body?: any;
    result?: any;
    error?: any;
  }) => any;
}

export const AUDITABLE_METADATA_KEY = 'auditable';

export const Auditable = (options: AuditableOptions) =>
  SetMetadata(AUDITABLE_METADATA_KEY, options);
