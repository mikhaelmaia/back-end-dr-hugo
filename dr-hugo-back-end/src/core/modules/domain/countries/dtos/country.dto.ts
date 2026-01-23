export class CountryFlagsDto {
  svg: string;
  alt: string;

  constructor(svg: string, alt: string) {
    this.svg = svg;
    this.alt = alt;
  }
}

export class CountryDto {
  flags: CountryFlagsDto;
  idd: string;
  acronym: string;

  constructor(flags: CountryFlagsDto, idd: string, acronym: string) {
    this.flags = flags;
    this.idd = idd;
    this.acronym = acronym;
  }
}

export class CountriesResponseDto {
  [acronym: string]: CountryDto;
}