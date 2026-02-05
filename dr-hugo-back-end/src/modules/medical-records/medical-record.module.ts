import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientMedicalRecord } from './entities/medical-record.entity';
import { PatientMedicalRecordController } from './medical-record.controller';
import { PatientMedicalRecordService } from './medical-record.service';
import { PatientMedicalRecordRepository } from './medical-record.repository';
import { PatientMedicalRecordMapper } from './medical-record.mapper';
import { PatientsModule } from '../patients/patients.module';
import { AuditModule } from 'src/core/modules/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientMedicalRecord]),
    PatientsModule,
    AuditModule,
  ],
  controllers: [PatientMedicalRecordController],
  providers: [
    PatientMedicalRecordService,
    PatientMedicalRecordRepository,
    PatientMedicalRecordMapper,
  ],
  exports: [PatientMedicalRecordService],
})
export class MedicalRecordModule {}
