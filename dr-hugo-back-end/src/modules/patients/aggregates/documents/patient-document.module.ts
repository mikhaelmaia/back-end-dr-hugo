import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientDocument } from './entities/patient-document.entity';
import { PatientDocumentMedia } from './entities/patient-document-media.entity';
import { PatientDocumentService } from './patient-document.service';
import { PatientDocumentRepository } from './patient-document.repository';
import { PatientDocumentMapper } from './patient-document.mapper';
import { MediaModule } from 'src/core/modules/media/media.module';
import { TuusCategoryModule } from 'src/core/modules/domain/tuus-category/tuus-category.module';
import { PatientsModule } from '../../patients.module';
import { PatientDocumentController } from './patient-document.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientDocument, PatientDocumentMedia]),
    MediaModule,
    TuusCategoryModule,
    PatientsModule,
  ],
  providers: [
    PatientDocumentService,
    PatientDocumentRepository,
    PatientDocumentMapper,
  ],
  controllers: [PatientDocumentController],
  exports: [
    PatientDocumentService,
    PatientDocumentRepository,
    PatientDocumentMapper,
  ],
})
export class PatientDocumentModule {}
