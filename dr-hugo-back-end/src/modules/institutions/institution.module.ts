import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionController } from './institution.controller';
import { InstitutionService } from './institution.service';
import { InstitutionRepository } from './institution.repository';
import { InstitutionMapper } from './institution.mapper';
import { InstitutionAdapter } from './institution.adapter';
import { Institution } from './entities/institution.entity';
import { InstitutionCompany } from './aggregates/company/entities/company.entity';
import { InstitutionCompanyRepresentative } from './aggregates/representative/entities/representative.entity';
import { CacheModule } from 'src/core/modules/cache/cache.module';
import { ExternalModule } from 'src/core/modules/external/external.module';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Institution,
      InstitutionCompany,
      InstitutionCompanyRepresentative
    ]),
    CacheModule,
    ExternalModule,
    UserModule
  ],
  controllers: [InstitutionController],
  providers: [
    InstitutionService,
    InstitutionRepository,
    InstitutionMapper,
    InstitutionAdapter
  ],
  exports: [
    InstitutionService
  ]
})
export class InstitutionModule {}