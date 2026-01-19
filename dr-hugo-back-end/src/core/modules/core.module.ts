import { Module } from '@nestjs/common';
import { AuditModule } from './audit/audit.module';
import { CacheModule } from './cache/cache.module';
import { CryptoModule } from './crypto/crypto.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [AuditModule, CacheModule, CryptoModule, EmailModule],
  exports: [AuditModule, CacheModule, CryptoModule, EmailModule],
})
export class CoreModule {}
