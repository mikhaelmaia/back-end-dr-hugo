import { Injectable } from '@nestjs/common';
import { TermsService } from './terms/terms.service';
import { CountriesService } from './countries/countries.service';
import { TermsType } from '../../vo/consts/enums';
import { TermDto } from './terms/dtos/term.dto';
import { CountryDto } from './countries/dtos/country.dto';
import { CountriesPaginationDto } from './countries/dtos/countries-pagination.dto';
import { Page } from '../../vo/types/types';

@Injectable()
export class DomainService {
  constructor(
    private readonly termsService: TermsService,
    private readonly countriesService: CountriesService,
  ) {}

  public async getTermsByType(termType: TermsType): Promise<TermDto> {
    return this.termsService.getTerms(termType);
  }

  public async getAllTerms(): Promise<Record<TermsType, TermDto>> {
    return this.termsService.getAllTerms();
  }

  public getCountryByAcronym(acronym: string): CountryDto | null {
    return this.countriesService.getCountryByAcronym(acronym);
  }

  public getAllCountries(): CountryDto[] {
    return this.countriesService.getAllCountries();
  }

  public getPaginatedCountries(paginationDto: CountriesPaginationDto): Page<CountryDto> {
    return this.countriesService.getPaginatedCountries(paginationDto);
  }
}