import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorModule } from './doctors/doctor.module';
import { InstitutionModule } from './institutions/institution.module';
import { MedicalRecordModule } from './medical-records/medical-record.module';

@Module({
  imports: [UserModule, PatientsModule, DoctorModule, InstitutionModule, MedicalRecordModule],
  exports: [UserModule, PatientsModule, DoctorModule, InstitutionModule, MedicalRecordModule],
})
export class ManagerModule {}
