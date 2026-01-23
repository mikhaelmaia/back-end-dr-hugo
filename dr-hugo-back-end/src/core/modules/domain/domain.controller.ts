import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'src/core/vo/decorators/public.decorator';
import { DomainService } from './domain.service';
import { DomainPaths, TermsPaths, CountriesPaths } from '../../vo/consts/paths';
import { TermsType } from '../../vo/consts/enums';
import { TermDto } from './terms/dtos/term.dto';
import { CountryDto } from './countries/dtos/country.dto';

@Public()
@Controller(DomainPaths.BASE)
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get(TermsPaths.FIND_BY_TYPE_FULL)
  public async getTermsByType(@Param('type') type: TermsType): Promise<TermDto> {
    return this.domainService.getTermsByType(type);
  }

  @Get(TermsPaths.ALL_FULL)
  public async getAllTerms(): Promise<Record<TermsType, TermDto>> {
    return this.domainService.getAllTerms();
  }

  @Get(CountriesPaths.BY_ACRONYM_FULL)
  public getCountryByAcronym(@Param('acronym') acronym: string): CountryDto | null {
    return this.domainService.getCountryByAcronym(acronym);
  }

  @Get(CountriesPaths.ALL_FULL)
  public getAllCountries(): CountryDto[] {
    return this.domainService.getAllCountries();
  }
}