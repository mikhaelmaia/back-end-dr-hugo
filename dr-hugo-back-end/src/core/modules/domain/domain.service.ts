import { Injectable } from '@nestjs/common';
import { TermsService } from './terms/terms.service';
import { CountriesService } from './countries/countries.service';
import { EnumType, TermsType, PatientDocumentType } from '../../vo/consts/enums';
import { TermDto } from './terms/dtos/term.dto';
import { CountryDto } from './countries/dtos/country.dto';
import { CountriesPaginationDto } from './countries/dtos/countries-pagination.dto';
import { Page } from '../../vo/types/types';
import { EnumsService } from './enums/enums.service';
import { EnumDto } from './enums/dtos/enum.dto';
import { MedicalDocumentService } from './medical-document/medical-document.service';
import { MedicalDocumentDescriptionDto } from './medical-document/dtos/medical-document-description.dto';

@Injectable()
export class DomainService {
  constructor(
    private readonly termsService: TermsService,
    private readonly countriesService: CountriesService,
    private readonly enumsService: EnumsService,
    private readonly medicalDocumentService: MedicalDocumentService,
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

  public getEnumValues(enumType: EnumType): EnumDto[] {
    return this.enumsService.getEnumValues(enumType);
  }

  public async getMedicalDocumentDescriptionsByType(
    type: PatientDocumentType,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ): Promise<MedicalDocumentDescriptionDto> {
    return this.medicalDocumentService.getDescriptionOptionsByType(type, page, limit, search);
  }
}