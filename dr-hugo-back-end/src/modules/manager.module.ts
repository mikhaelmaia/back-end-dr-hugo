import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorModule } from './doctors/doctor.module';
import { InstitutionModule } from './institutions/institution.module';
import { MedicalRecordModule } from './medical-records/medical-record.module';
import { UserChangeRequestModule } from './users/aggregates/change-request/user-change-request.module';
import { PatientAccessCodeModule } from './patients/aggregates/access-code/patient-access-code.module';

@Module({
  imports: [
    UserModule,
    PatientsModule,
    DoctorModule,
    InstitutionModule,
    MedicalRecordModule,
    UserChangeRequestModule,
    PatientAccessCodeModule,
  ],
  exports: [
    UserModule,
    PatientsModule,
    DoctorModule,
    InstitutionModule,
    MedicalRecordModule,
    UserChangeRequestModule,
    PatientAccessCodeModule,
  ],
})
export class ManagerModule {}
