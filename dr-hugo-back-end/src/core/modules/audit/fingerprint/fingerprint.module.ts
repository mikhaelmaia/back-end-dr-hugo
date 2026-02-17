import { Module } from '@nestjs/common';
import { FingerprintService } from './fingerprint.service';
import { CryptoModule } from '../../crypto/crypto.module';

@Module({
  imports: [CryptoModule],
  providers: [FingerprintService],
  exports: [FingerprintService],
})
export class FingerprintModule {}
