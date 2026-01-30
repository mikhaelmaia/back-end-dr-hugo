import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorModule } from './doctors/doctor.module';
import { InstitutionModule } from './institutions/institution.module';

@Module({
  imports: [UserModule, PatientsModule, DoctorModule, InstitutionModule],
  exports: [UserModule, PatientsModule, DoctorModule, InstitutionModule],
})
export class ManagerModule {}
