import { ApiProperty } from '@nestjs/swagger';

export class CountryFlagsDto {
  @ApiProperty({
    description: 'URL da bandeira do país em formato SVG',
    example: 'https://flagcdn.com/br.svg',
    type: String
  })
  svg: string;

  @ApiProperty({
    description: 'Texto alternativo para a bandeira do país',
    example: 'Bandeira do Brasil',
    type: String
  })
  alt: string;

  constructor(svg: string, alt: string) {
    this.svg = svg;
    this.alt = alt;
  }
}

export class CountryDto {
  @ApiProperty({
    description: 'Informações sobre a bandeira do país',
    type: CountryFlagsDto
  })
  flags: CountryFlagsDto;

  @ApiProperty({
    description: 'Código de discagem internacional do país',
    example: '+55',
    type: String
  })
  idd: string;

  @ApiProperty({
    description: 'Sigla/código do país (ISO 3166-1 alpha-2)',
    example: 'BR',
    type: String,
    minLength: 2,
    maxLength: 2
  })
  acronym: string;

  constructor(flags: CountryFlagsDto, idd: string, acronym: string) {
    this.flags = flags;
    this.idd = idd;
    this.acronym = acronym;
  }
}