import { Injectable } from '@nestjs/common';
import { ClientFingerprintDto } from './dtos/client-fingerprint.dto';
import { Fingerprint } from './entities/fingerprint.entity';

@Injectable()
export class FingerprintService {
  public process(data: {
    fingerprint: ClientFingerprintDto;
    ip: string;
    userAgent: string;
    sessionId: string | null;
  }): Fingerprint {
    return this.create(data);
  }

  private create(data: {
    fingerprint: ClientFingerprintDto;
    ip: string;
    userAgent: string;
    sessionId: string | null;
  }): Fingerprint {
    const entity = new Fingerprint();
    entity.fingerprint = JSON.stringify(data.fingerprint);
    entity.ip = data.ip;
    entity.userAgent = data.userAgent;
    entity.sessionId = data.sessionId;
    entity.version = data.fingerprint.version ?? 'unknown';

    return entity;
  }
}
