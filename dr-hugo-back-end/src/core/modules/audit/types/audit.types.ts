import { UserDto } from 'src/modules/users/dtos/user.dto';
import { ClientFingerprintDto } from '../fingerprint/dtos/client-fingerprint.dto';

export interface AuditDataPayload {
  ip: string;
  userAgent: string;
  sessionId?: string;
  fingerprint?: ClientFingerprintDto;
  author?: UserDto;
}
