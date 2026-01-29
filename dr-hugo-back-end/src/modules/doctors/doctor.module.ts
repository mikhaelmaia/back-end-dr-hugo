import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { DoctorRepository } from './doctor.repository';
import { DoctorMapper } from './doctor.mapper';
import { DoctorAdapter } from './doctor.adapter';
import { Doctor } from './entities/doctor.entity';
import { DoctorRegistration } from './aggregates/registration/entities/doctor-registration.entity';
import { DoctorSpecialization } from './aggregates/specialization/entities/doctor-specialization.entity';
import { CacheModule } from 'src/core/modules/cache/cache.module';
import { ExternalModule } from 'src/core/modules/external/external.module';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Doctor,
      DoctorRegistration,
      DoctorSpecialization
    ]),
    CacheModule,
    ExternalModule,
    UserModule
  ],
  controllers: [DoctorController],
  providers: [
    DoctorService,
    DoctorRepository,
    DoctorMapper,
    DoctorAdapter
  ],
  exports: [
    DoctorService
  ]
})
export class DoctorModule {}