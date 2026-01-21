import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Audit } from './entities/audit.entity';
import { Fingerprint } from './fingerprint/entities/fingerprint.entity';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditRepository } from './audit.repository';
import { AuditMapper } from './audit.mapper';
import { FingerprintModule } from './fingerprint/fingerprint.module';
import { AuditInterceptor } from '../../config/interceptors/audit.interceptor';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Audit, Fingerprint]), FingerprintModule],
  controllers: [AuditController],
  providers: [
    AuditService,
    AuditRepository,
    AuditMapper,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [FingerprintModule, AuditService, AuditRepository, AuditMapper],
})
export class AuditModule {}
