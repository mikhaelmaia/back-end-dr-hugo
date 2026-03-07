import { Module } from '@nestjs/common';
import { DomainController } from './domain.controller';
import { DomainService } from './domain.service';
import { TermsModule } from './terms/terms.module';
import { CountriesModule } from './countries/countries.module';
import { EnumsModule } from './enums/enums.module';
import { MedicalDocumentModule } from './medical-document/medical-document.module';
import { TuusCategoryModule } from './tuus-category/tuus-category.module';

@Module({
  imports: [
    TermsModule,
    CountriesModule,
    EnumsModule,
    MedicalDocumentModule,
    TuusCategoryModule,
  ],
  controllers: [DomainController],
  providers: [DomainService],
  exports: [DomainService],
})
export class DomainModule {}
