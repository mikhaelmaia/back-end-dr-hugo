import { Injectable } from '@nestjs/common';
import { ClientFingerprintDto } from './dtos/client-fingerprint.dto';
import { Fingerprint } from './entities/fingerprint.entity';
import { CryptoService } from '../../crypto/crypto.service';

@Injectable()
export class FingerprintService {
  constructor(private readonly cryptoService: CryptoService) {}

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
    entity.fingerprint = this.cryptoService.hashForSearch(
      JSON.stringify(data.fingerprint),
    );
    entity.ip = this.cryptoService.encrypt(data.ip);
    entity.userAgent = data.userAgent;
    entity.sessionId = data.sessionId;
    entity.version = data.fingerprint.version ?? 'unknown';

    return entity;
  }
}
