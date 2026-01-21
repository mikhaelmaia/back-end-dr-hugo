import { EncryptedTransformer } from 'src/core/vo/transformers/encrypted.transformer';
import { CryptoService } from './crypto.service';
import { ValueTransformer } from 'typeorm';

export class CryptoTransformerFactory {
  private static encryptedTransformer: ValueTransformer;

  public static createEncrypted(
    cryptoService: CryptoService,
  ): ValueTransformer {
    if (!this.encryptedTransformer) {
      this.encryptedTransformer = new EncryptedTransformer(cryptoService);
    }

    return this.encryptedTransformer;
  }
}
