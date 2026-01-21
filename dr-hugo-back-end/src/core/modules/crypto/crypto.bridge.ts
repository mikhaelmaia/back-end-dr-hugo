import { CryptoService } from './crypto.service';

export class CryptoBridge {
  private static cryptoService: CryptoService;

  public static register(service: CryptoService) {
    this.cryptoService = service;
  }

  public static get(): CryptoService {
    if (!this.cryptoService) {
      throw new Error('CryptoService not registered');
    }
    return this.cryptoService;
  }
}
