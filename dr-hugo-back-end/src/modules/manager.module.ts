import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorModule } from './doctors/doctor.module';
import { InstitutionModule } from './institutions/institution.module';
import { MedicalRecordModule } from './medical-records/medical-record.module';
import { UserChangeRequestModule } from './users/aggregates/change-request/user-change-request.module';
import { PatientAccessCodeModule } from './patients/aggregates/access-code/patient-access-code.module';
import { PatientDocumentModule } from './patients/aggregates/documents/patient-document.module';
import { PatientPermissionGrantModule } from './patients/aggregates/permission-grant/patient-permission-grant.module';
import { DoctorGrantModule } from './patients/aggregates/doctor-grant/doctor-grant.module';
import { InstitutionGrantModule } from './patients/aggregates/institution-grant/institution-grant.module';

@Module({
  imports: [
    UserModule,
    PatientsModule,
    DoctorModule,
    InstitutionModule,
    MedicalRecordModule,
    UserChangeRequestModule,
    PatientAccessCodeModule,
    PatientDocumentModule,
    PatientPermissionGrantModule,
    DoctorGrantModule,
    InstitutionGrantModule,
  ],
  exports: [
    UserModule,
    PatientsModule,
    DoctorModule,
    InstitutionModule,
    MedicalRecordModule,
    UserChangeRequestModule,
    PatientAccessCodeModule,
    PatientDocumentModule,
    PatientPermissionGrantModule,
    DoctorGrantModule,
    InstitutionGrantModule,
  ],
})
export class ManagerModule {}
