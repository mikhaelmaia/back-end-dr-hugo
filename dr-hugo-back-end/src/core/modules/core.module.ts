import { Module } from '@nestjs/common';
import { AuditModule } from './audit/audit.module';
import { CacheModule } from './cache/cache.module';
import { CryptoModule } from './crypto/crypto.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [AuditModule, AuthModule, CacheModule, CryptoModule, EmailModule, MediaModule, TokenModule],
  exports: [AuditModule, AuthModule, CacheModule, CryptoModule, EmailModule, MediaModule, TokenModule],
})
export class CoreModule {}
