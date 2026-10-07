import { Module } from '@nestjs/common';
import { AuditModule } from './audit/audit.module';
import { CacheModule } from './cache/cache.module';
import { CryptoModule } from './crypto/crypto.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';
import { TokenModule } from './token/token.module';
import { DomainModule } from './domain/domain.module';
import { ExternalModule } from './external/external.module';
import { HealthModule } from './health/health.module';
import { AddressModule } from './address/address.module';
import { ResolutionKeyModule } from './resolution-key/resolution-key.module';
import { QrCodeModule } from './qr-code/qr-code.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    AddressModule,
    AuditModule,
    AuthModule,
    CacheModule,
    CryptoModule,
    DomainModule,
    EmailModule,
    ExternalModule,
    HealthModule,
    MediaModule,
    NotificationsModule,
    QrCodeModule,
    ResolutionKeyModule,
    TokenModule,
    WhatsAppModule,
  ],
  exports: [
    AddressModule,
    AuditModule,
    AuthModule,
    CacheModule,
    CryptoModule,
    DomainModule,
    EmailModule,
    ExternalModule,
    HealthModule,
    MediaModule,
    NotificationsModule,
    QrCodeModule,
    ResolutionKeyModule,
    TokenModule,
    WhatsAppModule,
  ],
})
export class CoreModule {}
