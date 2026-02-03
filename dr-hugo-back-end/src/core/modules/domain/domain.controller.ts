import { Controller, Get, Param, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Public } from 'src/core/vo/decorators/public.decorator';
import { DomainService } from './domain.service';
import { DomainPaths, TermsPaths, CountriesPaths } from '../../vo/consts/paths';
import { TermsType, EnumType } from '../../vo/consts/enums';
import { TermDto } from './terms/dtos/term.dto';
import { CountryDto } from './countries/dtos/country.dto';
import { CountriesPaginationDto } from './countries/dtos/countries-pagination.dto';
import { EnumDto } from './enums/dtos/enum.dto';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import type { Page } from '../../vo/types/types';

@ApiTags('Domínio')
@Public()
@Controller(DomainPaths.BASE)
export class DomainController {
  constructor(
    private readonly domainService: DomainService
  ) {}

  @Get('/enums/:type')
  @ApiOperation({
    summary: 'Buscar enum por tipo',
    description: 'Retorna os valores de um enum específico no formato key-value para uso em formulários e dropdowns'
  })
  @ApiParam({
    name: 'type',
    description: 'Tipo de enum a ser buscado',
    enum: EnumType,
    example: EnumType.BRAZILIAN_STATE
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Valores do enum retornados com sucesso',
    type: [EnumDto]
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Tipo de enum inválido',
    type: ExceptionResponse
  })
  public getEnumValues(@Param('type') type: EnumType): EnumDto[] {
    return this.domainService.getEnumValues(type);
  }

  @Get(TermsPaths.ALL_FULL)
  @ApiOperation({
    summary: 'Buscar todos os termos',
    description: 'Retorna todos os tipos de termos (política de privacidade e termos de serviço) em um objeto'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Termos encontrados com sucesso',
    schema: {
      type: 'object',
      properties: {
        privacy_policy: { $ref: '#/components/schemas/TermDto' },
        terms_of_service: { $ref: '#/components/schemas/TermDto' }
      },
      example: {
        privacy_policy: {
          title: 'Política de Privacidade',
          content: 'Conteúdo da política de privacidade...'
        },
        terms_of_service: {
          title: 'Termos de Serviço',
          content: 'Conteúdo dos termos de serviço...'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor ao buscar os termos',
    type: ExceptionResponse
  })
  public async getAllTerms(): Promise<Record<TermsType, TermDto>> {
    return this.domainService.getAllTerms();
  }

  @Get(TermsPaths.FIND_BY_TYPE_FULL)
  @ApiOperation({
    summary: 'Buscar termos por tipo',
    description: 'Retorna os termos (política de privacidade ou termos de serviço) baseado no tipo especificado'
  })
  @ApiParam({
    name: 'type',
    description: 'Tipo de termo a ser buscado',
    enum: TermsType,
    example: TermsType.PRIVACY_POLICY
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Termo encontrado com sucesso',
    type: TermDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Termo não encontrado para o tipo especificado',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Tipo de termo inválido',
    type: ExceptionResponse
  })
  public async getTermsByType(@Param('type') type: TermsType): Promise<TermDto> {
    return this.domainService.getTermsByType(type);
  }

  @Get(CountriesPaths.ALL_FULL)
  @ApiOperation({
    summary: 'Buscar todos os países',
    description: 'Retorna uma lista com todos os países disponíveis, incluindo bandeiras e códigos de discagem. ⚠️ Esta consulta pode retornar muito dados (>3MB). Use a rota paginada para melhor performance.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de países retornada com sucesso',
    type: [CountryDto],
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/CountryDto' }
    }
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor ao buscar os países',
    type: ExceptionResponse
  })
  public getAllCountries(): CountryDto[] {
    return this.domainService.getAllCountries();
  }

  @Get(CountriesPaths.BY_ACRONYM_FULL)
  @ApiOperation({
    summary: 'Buscar país por sigla',
    description: 'Retorna as informações de um país baseado na sigla (código de duas letras)'
  })
  @ApiParam({
    name: 'acronym',
    description: 'Sigla do país (código ISO 3166-1 alpha-2)',
    example: 'BRA',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'País encontrado com sucesso',
    type: CountryDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'País não encontrado para a sigla especificada',
    schema: {
      type: 'null',
      example: null
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Sigla do país inválida ou mal formatada',
    type: ExceptionResponse
  })
  public getCountryByAcronym(@Param('acronym') acronym: string): CountryDto | null {
    return this.domainService.getCountryByAcronym(acronym);
  }

  @Get(CountriesPaths.PAGINATED_FULL)
  @ApiOperation({
    summary: 'Buscar países com paginação',
    description: 'Retorna uma lista paginada de países com filtros e ordenação opcionais. Recomendado para consultas que podem retornar muitos dados.'
  })
  @ApiQuery({
    name: 'page',
    description: 'Número da página (começando em 1)',
    example: 1,
    required: false,
    type: Number
  })
  @ApiQuery({
    name: 'limit',
    description: 'Quantidade de países por página (máximo 100)',
    example: 20,
    required: false,
    type: Number
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'Campo para ordenação',
    enum: ['name', 'acronym'],
    required: false,
    type: String
  })
  @ApiQuery({
    name: 'sortOrder',
    description: 'Ordem da ordenação',
    enum: ['ASC', 'DESC'],
    required: false,
    type: String
  })
  @ApiQuery({
    name: 'name',
    description: 'Filtro por nome do país (busca parcial)',
    required: false,
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Página de países retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/CountryDto' }
        },
        totalItems: {
          type: 'number',
          description: 'Total de países encontrados',
          example: 195
        },
        currentPage: {
          type: 'number', 
          description: 'Página atual',
          example: 1
        },
        totalPages: {
          type: 'number',
          description: 'Total de páginas disponíveis',
          example: 10
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parâmetros de paginação inválidos',
    type: ExceptionResponse
  })
  public getPaginatedCountries(@Query() paginationDto: CountriesPaginationDto): Page<CountryDto> {
    return this.domainService.getPaginatedCountries(paginationDto);
  }
}