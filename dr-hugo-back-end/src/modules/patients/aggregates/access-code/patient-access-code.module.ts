import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientAccessCode } from './entities/patient-access-code.entity';
import { QrCodeModule } from 'src/core/modules/qr-code/qr-code.module';
import { PatientAccessCodeController } from './patient-access-code.controller';
import { PatientAccessCodeService } from './patient-access-code.service';
import { PatientAccessCodeRepository } from './patient-access-code.repository';
import { PatientAccessCodeMapper } from './patient-access-code.mapper';
import { PatientsModule } from '../../patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientAccessCode]),
    QrCodeModule,
    PatientsModule,
  ],
  controllers: [PatientAccessCodeController],
  providers: [
    PatientAccessCodeService,
    PatientAccessCodeRepository,
    PatientAccessCodeMapper,
  ],
  exports: [PatientAccessCodeService],
})
export class PatientAccessCodeModule {}
