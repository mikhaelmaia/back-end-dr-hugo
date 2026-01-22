import { CryptoService } from './crypto.service';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

export class CryptoBridge {
  private static cryptoService: CryptoService;

  public static register(service: CryptoService) {
    this.cryptoService = service;
  }

  public static get(): CryptoService {
    if (!this.cryptoService) {
      config();
      const configService = new ConfigService({
        application: {
          cryptoKey: process.env.CRYPTO_KEY
        }
      });
      this.cryptoService = new CryptoService(configService);
    }
    return this.cryptoService;
  }
}
