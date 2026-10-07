import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly config: ConfigService) {
    this.key = this.loadKey();
  }

  public encrypt(value: string): string {
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  public decrypt(value: string): string {
    try {
      const buffer = Buffer.from(value, 'base64');

      if (buffer.length < 28) {
        throw new BadRequestException('Valor inválido para descriptografia');
      }

      const iv = buffer.subarray(0, 12);
      const authTag = buffer.subarray(12, 28);
      const encrypted = buffer.subarray(28);

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch {
      throw new BadRequestException('Falha ao descriptografar valor');
    }
  }

  public hashForSearch(value: string): string {
    return crypto.createHmac('sha256', this.key).update(value).digest('hex');
  }

  private loadKey(): Buffer {
    const value = this.config.get<string>('CRYPTO_KEY');

    if (!value) {
      throw new InternalServerErrorException('CRYPTO_KEY não definida');
    }

    const key = Buffer.from(value, 'hex');

    if (key.length !== 32) {
      throw new InternalServerErrorException(
        'CRYPTO_KEY deve conter 64 caracteres hex (32 bytes)',
      );
    }

    return key;
  }
}
