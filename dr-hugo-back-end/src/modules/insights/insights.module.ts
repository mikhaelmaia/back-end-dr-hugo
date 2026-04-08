import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaModule } from 'src/core/modules/media/media.module';
import { PatientDocument } from '../patients/aggregates/documents/entities/patient-document.entity';
import { PatientDoctorGrant } from '../patients/aggregates/permission-grant/entities/patient-doctor-grant.entity';
import { PatientInstitutionGrant } from '../patients/aggregates/permission-grant/entities/patient-institution-grant.entity';
import { DoctorModule } from '../doctors/doctor.module';
import { InstitutionModule } from '../institutions/institution.module';
import { PatientsModule } from '../patients/patients.module';
import { InsightsController } from './insights.controller';
import { InsightsMapper } from './insights.mapper';
import { InsightsRepository } from './insights.repository';
import { InsightsService } from './insights.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientDocument,
      PatientDoctorGrant,
      PatientInstitutionGrant,
    ]),
    PatientsModule,
    DoctorModule,
    InstitutionModule,
    MediaModule,
  ],
  controllers: [InsightsController],
  providers: [InsightsService, InsightsRepository, InsightsMapper],
})
export class InsightsModule {}
