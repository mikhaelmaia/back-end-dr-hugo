import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorModule } from 'src/modules/doctors/doctor.module';
import { InstitutionModule } from 'src/modules/institutions/institution.module';
import { PatientsModule } from 'src/modules/patients/patients.module';
import { NotificationsModule } from 'src/core/modules/notifications/notifications.module';
import { MediaModule } from 'src/core/modules/media/media.module';
import { MedicalRecordModule } from 'src/modules/medical-records/medical-record.module';
import { CryptoModule } from 'src/core/modules/crypto/crypto.module';
import { PatientAccessCodeModule } from '../access-code/patient-access-code.module';
import { PatientDoctorGrant } from './entities/patient-doctor-grant.entity';
import { PatientInstitutionGrant } from './entities/patient-institution-grant.entity';
import { PatientPermissionGrantController } from './patient-permission-grant.controller';
import { PatientPermissionGrantMapper } from './patient-permission-grant.mapper';
import { PatientPermissionGrantRepository } from './patient-permission-grant.repository';
import { PatientPermissionGrantService } from './patient-permission-grant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientDoctorGrant, PatientInstitutionGrant]),
    CryptoModule,
    PatientAccessCodeModule,
    DoctorModule,
    InstitutionModule,
    PatientsModule,
    NotificationsModule,
    MediaModule,
    MedicalRecordModule,
  ],
  controllers: [PatientPermissionGrantController],
  providers: [
    PatientPermissionGrantService,
    PatientPermissionGrantRepository,
    PatientPermissionGrantMapper,
  ],
  exports: [PatientPermissionGrantService],
})
export class PatientPermissionGrantModule {}
