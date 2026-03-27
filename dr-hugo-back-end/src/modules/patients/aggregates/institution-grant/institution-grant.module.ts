import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionModule } from 'src/modules/institutions/institution.module';
import { PatientsModule } from 'src/modules/patients/patients.module';
import { PatientInstitutionGrant } from '../permission-grant/entities/patient-institution-grant.entity';
import { PatientDocumentModule } from '../documents/patient-document.module';
import { InstitutionGrantController } from './institution-grant.controller';
import { InstitutionGrantRepository } from './institution-grant.repository';
import { InstitutionGrantService } from './institution-grant.service';
import { InstitutionGrantMapper } from './institution-grant.mapper';
import { MediaModule } from 'src/core/modules/media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientInstitutionGrant]),
    InstitutionModule,
    PatientsModule,
    PatientDocumentModule,
    MediaModule,
  ],
  controllers: [InstitutionGrantController],
  providers: [
    InstitutionGrantService,
    InstitutionGrantRepository,
    InstitutionGrantMapper,
  ],
  exports: [InstitutionGrantService],
})
export class InstitutionGrantModule {}
