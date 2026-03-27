import { Module } from '@nestjs/common';
import { AuthModule } from 'src/core/modules/auth/auth.module';
import { DoctorModule } from 'src/modules/doctors/doctor.module';
import { InstitutionModule } from 'src/modules/institutions/institution.module';
import { PatientsModule } from 'src/modules/patients/patients.module';
import { WsAuthGuard } from './guards/ws-auth.guard';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [AuthModule, PatientsModule, DoctorModule, InstitutionModule],
  providers: [NotificationsGateway, NotificationsService, WsAuthGuard],
  exports: [NotificationsService, WsAuthGuard],
})
export class NotificationsModule {}
