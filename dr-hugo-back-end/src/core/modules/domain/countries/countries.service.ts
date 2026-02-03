import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CountryDto, CountryFlagsDto } from "./dtos/country.dto";
import { CountriesPaginationDto } from "./dtos/countries-pagination.dto";
import { Page } from "../../../vo/types/types";

class CountriesResponseDto {
  [acronym: string]: CountryDto;
}

@Injectable()
export class CountriesService {
    private countriesData: CountriesResponseDto | null = null;
    private readonly countriesFilePath = join(process.cwd(), 'src', 'core', 'resources', 'countries', 'countries-data.json');
    private readonly logger = new Logger(CountriesService.name);

    private loadCountriesData(): CountriesResponseDto {
        if (this.countriesData) {
            return this.countriesData;
        }
        try {
            const fileContent = readFileSync(this.countriesFilePath, 'utf8');
            this.countriesData = JSON.parse(fileContent);
            return this.countriesData;
        } catch (error) {
            this.logger.error('Erro ao carregar os dados dos países:', error);
            throw new InternalServerErrorException('Não foi possível carregar os dados dos países.');
        }
    }

    public getCountryByAcronym(acronym: string): CountryDto | null {
        const countriesData = this.loadCountriesData();
        const countryData = countriesData[acronym.toUpperCase()];
        if (!countryData) return null;
        
        return new CountryDto(
            countryData.name,
            new CountryFlagsDto(countryData.flags.svg, countryData.flags.alt),
            countryData.idd,
            countryData.acronym
        );
    }

    public getAllCountries(): CountryDto[] {
        const countriesData = this.loadCountriesData();
        return Object.values(countriesData).map(country => 
            new CountryDto(
                country.name,
                new CountryFlagsDto(country.flags.svg, country.flags.alt),
                country.idd,
                country.acronym
            )
        );
    }

    public getPaginatedCountries(paginationDto: CountriesPaginationDto): Page<CountryDto> {
        const countriesData = this.loadCountriesData();
        let countries = Object.values(countriesData).map(country => 
            new CountryDto(
                country.name,
                new CountryFlagsDto(country.flags.svg, country.flags.alt),
                country.idd,
                country.acronym
            )
        );

        if (paginationDto.name) {
            const nameFilter = paginationDto.name.toLowerCase();
            countries = countries.filter(country => 
                country.name.toLowerCase().includes(nameFilter)
            );
        }

        countries.sort((a, b) => {
            let aValue: string, bValue: string;
            
            if (paginationDto.sortBy === 'acronym') {
                aValue = a.acronym.toLowerCase();
                bValue = b.acronym.toLowerCase();
            } else {
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
            }

            if (paginationDto.sortOrder === 'DESC') {
                return bValue.localeCompare(aValue, 'pt-BR');
            }
            return aValue.localeCompare(bValue, 'pt-BR');
        });

        const page = paginationDto.page || 1;
        const limit = paginationDto.limit || 20;
        const totalItems = countries.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const paginatedCountries = countries.slice(startIndex, endIndex);

        return {
            items: paginatedCountries,
            totalItems,
            currentPage: page,
            totalPages
        };
    }
}