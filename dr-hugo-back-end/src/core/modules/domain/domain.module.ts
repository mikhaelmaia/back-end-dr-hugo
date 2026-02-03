import { Module } from '@nestjs/common';
import { DomainController } from './domain.controller';
import { DomainService } from './domain.service';
import { TermsModule } from './terms/terms.module';
import { CountriesModule } from './countries/countries.module';
import { EnumsModule } from './enums/enums.module';

@Module({
  imports: [TermsModule, CountriesModule, EnumsModule],
  controllers: [DomainController],
  providers: [DomainService],
  exports: [DomainService],
})
export class DomainModule {}