import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const cryptoKey = this.configService.get<string>('application.cryptoKey');

    if (!cryptoKey) {
      throw new Error(
        'A chave de criptografia não está definida nas variáveis de ambiente',
      );
    }

    try {
      this.key = Buffer.from(cryptoKey, 'hex');
    } catch (error) {
      throw new Error(
        `A chave de criptografia deve ser uma string hexadecimal válida: ${error.message}`,
      );
    }

    if (this.key.length !== 32) {
      throw new Error(
        'A chave de criptografia deve ter 32 bytes (64 caracteres hexadecimais)',
      );
    }
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
        throw new Error('Dados criptografados inválidos');
      }

      const iv = buffer.subarray(0, 12);
      const authTag = buffer.subarray(12, 28);
      const encrypted = buffer.subarray(28);

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      return decipher.update(encrypted) + decipher.final('utf8');
    } catch (error) {
      throw new Error(`Falha ao descriptografar valor: ${error.message}`);
    }
  }

  public isEncrypted(value: string): boolean {
    try {
      const buffer = Buffer.from(value, 'base64');
      return buffer.length >= 28;
    } catch {
      return false;
    }
  }
}
