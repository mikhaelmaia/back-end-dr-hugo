import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { PatientsModule } from './patients/patients.module';

@Module({
  imports: [UserModule, PatientsModule],
  exports: [UserModule, PatientsModule],
})
export class ManagerModule {}
