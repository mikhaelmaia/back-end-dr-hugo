import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorModule } from 'src/modules/doctors/doctor.module';
import { PatientsModule } from 'src/modules/patients/patients.module';
import { PatientDoctorGrant } from '../permission-grant/entities/patient-doctor-grant.entity';
import { PatientDocumentModule } from '../documents/patient-document.module';
import { DoctorGrantController } from './doctor-grant.controller';
import { DoctorGrantRepository } from './doctor-grant.repository';
import { DoctorGrantService } from './doctor-grant.service';
import { DoctorGrantMapper } from './doctor-grant.mapper';
import { MediaModule } from 'src/core/modules/media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientDoctorGrant]),
    DoctorModule,
    PatientsModule,
    PatientDocumentModule,
    MediaModule,
  ],
  controllers: [DoctorGrantController],
  providers: [DoctorGrantService, DoctorGrantRepository, DoctorGrantMapper],
  exports: [DoctorGrantService],
})
export class DoctorGrantModule {}
