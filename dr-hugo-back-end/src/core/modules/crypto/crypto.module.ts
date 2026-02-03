import { Module, OnModuleInit } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoBridge } from './crypto.bridge';

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule implements OnModuleInit {
  constructor(private readonly cryptoService: CryptoService) {}

  onModuleInit() {
    CryptoBridge.register(this.cryptoService);
  }
}
