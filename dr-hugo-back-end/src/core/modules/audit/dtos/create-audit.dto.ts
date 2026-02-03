import { AuditDto } from './audit.dto';

export type CreateAuditDto = Omit<
  AuditDto,
  'id' | 'createdAt' | 'updatedAt' | 'author' | 'fingerprint'
>;
