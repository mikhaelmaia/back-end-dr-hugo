import { Module } from '@nestjs/common';
import { MedicalDocumentService } from './medical-document.service';
import { TuusCategoryModule } from '../tuus-category/tuus-category.module';

@Module({
  imports: [TuusCategoryModule],
  providers: [MedicalDocumentService],
  exports: [MedicalDocumentService],
})
export class MedicalDocumentModule {}
