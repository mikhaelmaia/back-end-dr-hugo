import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { EncryptedTransformer } from 'src/core/vo/transformers/encrypted.transformer';

@Module({
  providers: [
    CryptoService,
    {
      provide: EncryptedTransformer,
      useFactory: (cryptoService: CryptoService) =>
        new EncryptedTransformer(cryptoService),
      inject: [CryptoService],
    },
  ],
  exports: [CryptoService, EncryptedTransformer],
})
export class CryptoModule {}
