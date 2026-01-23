import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CountryDto, CountryFlagsDto } from "./dtos/country.dto";

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
            new CountryFlagsDto(countryData.flags.svg, countryData.flags.alt),
            countryData.idd,
            countryData.acronym
        );
    }

    public getAllCountries(): CountryDto[] {
        const countriesData = this.loadCountriesData();
        return Object.values(countriesData).map(country => 
            new CountryDto(
                new CountryFlagsDto(country.flags.svg, country.flags.alt),
                country.idd,
                country.acronym
            )
        );
    }
}