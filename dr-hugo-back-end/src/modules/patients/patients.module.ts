import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './patients.repository';
import { PatientsMapper } from './patients.mapper';
import { UserModule } from '../users/user.module';
import { AuditModule } from 'src/core/modules/audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Patient]), UserModule, AuditModule],
  controllers: [PatientsController],
  providers: [PatientsService, PatientsRepository, PatientsMapper],
  exports: [PatientsService, PatientsRepository, PatientsMapper],
})
export class PatientsModule {}
