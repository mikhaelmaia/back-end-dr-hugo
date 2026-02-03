import { CryptoService } from 'src/core/modules/crypto/crypto.service';
import { ValueTransformer } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EncryptedTransformer implements ValueTransformer {
  public constructor(private readonly crypto: CryptoService) {}

  public to(value?: string): string | null {
    if (!value) return null;

    try {
      return this.crypto.encrypt(value);
    } catch (error) {
      throw new Error(`Falha ao criptografar valor: ${error.message}`);
    }
  }

  public from(value?: string): string | null {
    if (!value) return null;

    try {
      return this.crypto.decrypt(value);
    } catch (error) {
      throw new Error(`Falha ao descriptografar valor: ${error.message}`);
    }
  }
}
