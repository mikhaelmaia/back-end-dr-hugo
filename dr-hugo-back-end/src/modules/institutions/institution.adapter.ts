import { Inject, Injectable } from '@nestjs/common';
import {
  CACHE_SERVICE,
  CacheService,
} from 'src/core/modules/cache/cache.service';
import { ReceitaWsService } from 'src/core/modules/external/receitaws/receitaws.service';
import { CnesService } from 'src/core/modules/external/cnes/cnes.service';
import {
  InstitutionValidatedDto,
  InstitutionValidationData,
  HealthInstitutionData,
  CnesValidatedDto,
  CnesValidationData,
} from './dtos/institution-validated.dto';
import {
  CompanyDto,
  CompanyQsaDto,
  ReceitaWsResponseDto,
} from 'src/core/modules/external/receitaws/dto/company.dto';
import {
  CnesResponseDto,
  CnesEstablishmentDto,
} from 'src/core/modules/external/cnes/dtos/cnes-response.dto';
import { formatToTitleCase } from 'src/core/utils/format.utils';

@Injectable()
export class InstitutionAdapter {
  private readonly CACHE_KEY_PREFIX = 'institution-validation-';
  private readonly CNES_CACHE_KEY_PREFIX = 'cnes-institution-';
  private readonly CNPJ_CACHE_KEY_PREFIX = 'cnpj-from-cnes-';
  private readonly VALIDATION_TTL_SECONDS = 3600;
  private readonly COMPANY_VALID_SITUATIONS = ['ATIVA', 'ATIVO'];

  constructor(
    private readonly receitaWsService: ReceitaWsService,
    private readonly cnesService: CnesService,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: CacheService,
  ) {}

  public async lookupByCnes(cnesCode: string): Promise<CnesValidatedDto> {
    const cached = await this.getCnesValidation(cnesCode);
    if (cached) return cached;

    const cnesResponse =
      await this.cnesService.getEstablishmentByCnes(cnesCode);

    if (!cnesResponse.success) {
      const error = this.buildCnesErrorResponse(cnesResponse);
      await this.cacheCnesData(cnesCode, error);
      return error;
    }

    const establishment = cnesResponse.establishmentData;
    const cnpjFromCnes = this.extractCnpjFromCnes(establishment);

    const validation = this.buildCnesValidationResponse(
      establishment,
      cnesCode,
      cnpjFromCnes,
    );

    await this.cacheCnesData(cnesCode, validation);

    if (cnpjFromCnes) {
      await this.cacheCnpjFromCnes(cnpjFromCnes, cnesCode);
    }

    return validation;
  }

  public async lookupTaxId(taxId: string): Promise<InstitutionValidatedDto> {
    const cached = await this.getValidation(taxId);
    if (cached) return cached;

    const cnesData = await this.resolveCnesDataFromCache(taxId);
    const effectiveTaxId = this.resolveEffectiveTaxId(taxId, cnesData);

    const response =
      await this.receitaWsService.getCompanyByTaxId(effectiveTaxId);

    const institution = this.mapToInstitutionValidatedDto(response, cnesData);

    await this.cacheValidation(taxId, institution);

    return institution;
  }

  public async refreshCompanyData(
    taxId: string,
  ): Promise<InstitutionValidatedDto> {
    const response = await this.receitaWsService.getCompanyByTaxId(taxId);
    return this.mapToInstitutionValidatedDto(response);
  }

  public async getValidation(
    taxId: string,
  ): Promise<InstitutionValidatedDto | null> {
    return (
      (await this.cacheService.get<InstitutionValidatedDto>(
        this.buildInstitutionCacheKey(taxId),
      )) || null
    );
  }

  public async getCnesValidation(
    cnesCode: string,
  ): Promise<CnesValidatedDto | null> {
    return (
      (await this.cacheService.get<CnesValidatedDto>(
        this.buildCnesCacheKey(cnesCode),
      )) || null
    );
  }

  private async resolveCnesDataFromCache(
    taxId: string,
  ): Promise<CnesValidatedDto | null> {
    const cnesCode = await this.getCnesCodeFromCnpj(taxId);
    if (!cnesCode) return null;
    return this.getCnesValidation(cnesCode);
  }

  private resolveEffectiveTaxId(
    taxId: string,
    cnesData: CnesValidatedDto | null,
  ): string {
    if (cnesData?.cnpjFound && cnesData.basicData?.taxId) {
      return cnesData.basicData.taxId;
    }
    return taxId;
  }

  private async cacheValidation(
    taxId: string,
    data: InstitutionValidatedDto,
  ): Promise<void> {
    await this.cacheService.set(
      this.buildInstitutionCacheKey(taxId),
      data,
      this.VALIDATION_TTL_SECONDS,
    );
  }

  private async cacheCnesData(
    cnesCode: string,
    data: CnesValidatedDto,
  ): Promise<void> {
    await this.cacheService.set(
      this.buildCnesCacheKey(cnesCode),
      data,
      this.VALIDATION_TTL_SECONDS,
    );
  }

  private async cacheCnpjFromCnes(
    cnpj: string,
    cnesCode: string,
  ): Promise<void> {
    await this.cacheService.set(
      this.buildCnpjCacheKey(cnpj),
      cnesCode,
      this.VALIDATION_TTL_SECONDS,
    );
  }

  private async getCnesCodeFromCnpj(taxId: string): Promise<string | null> {
    return (
      (await this.cacheService.get<string>(this.buildCnpjCacheKey(taxId))) ||
      null
    );
  }

  private buildInstitutionCacheKey(taxId: string): string {
    return `${this.CACHE_KEY_PREFIX}${taxId}`;
  }

  private buildCnesCacheKey(cnes: string): string {
    return `${this.CNES_CACHE_KEY_PREFIX}${cnes}`;
  }

  private buildCnpjCacheKey(cnpj: string): string {
    return `${this.CNPJ_CACHE_KEY_PREFIX}${cnpj}`;
  }

  private extractCnpjFromCnes(
    establishment: CnesEstablishmentDto,
  ): string | null {
    const { numero_cnpj, numero_cnpj_entidade } = establishment;
    return numero_cnpj ?? numero_cnpj_entidade ?? null;
  }

  private parseBooleanFlag(value?: number | null): boolean | undefined {
    if (value == null) return undefined;
    return value === 1;
  }

  private buildCnesErrorResponse(
    cnesResponse: CnesResponseDto,
  ): CnesValidatedDto {
    const result = new CnesValidatedDto();
    result.valid = false;
    result.cnpjFound = false;
    result.basicData = null;
    result.healthData = null;
    result.message =
      cnesResponse.error?.message || 'Erro ao consultar dados da instituição';
    return result;
  }

  private buildCnesValidationResponse(
    establishment: CnesEstablishmentDto,
    cnesCode: string,
    cnpjFound: string | null,
  ): CnesValidatedDto {
    const result = new CnesValidatedDto();
    result.valid = true;
    result.cnpjFound = !!cnpjFound;
    result.healthData = this.buildHealthInstitutionData(establishment);

    if (cnpjFound) {
      result.basicData = this.buildCnesValidationData(
        establishment,
        cnesCode,
        cnpjFound,
      );
      result.message = 'Instituição encontrada com CNPJ disponível';
    } else {
      result.message =
        'Instituição encontrada - CNPJ não informado no registro';
    }

    return result;
  }

  private buildHealthInstitutionData(
    establishment: CnesEstablishmentDto,
  ): HealthInstitutionData {
    const healthData = new HealthInstitutionData();

    healthData.organizationNature =
      establishment.natureza_organizacao_entidade || undefined;
    healthData.legalNatureDescription =
      establishment.descricao_natureza_juridica_estabelecimento || undefined;
    healthData.disablingReasonCode =
      establishment.codigo_motivo_desabilitacao_estabelecimento || undefined;

    healthData.hasSurgicalCenter = this.parseBooleanFlag(
      establishment.estabelecimento_possui_centro_cirurgico,
    );
    healthData.hasObstetricCenter = this.parseBooleanFlag(
      establishment.estabelecimento_possui_centro_obstetrico,
    );
    healthData.hasNeonatalCenter = this.parseBooleanFlag(
      establishment.estabelecimento_possui_centro_neonatal,
    );
    healthData.hasHospitalCare = this.parseBooleanFlag(
      establishment.estabelecimento_possui_atendimento_hospitalar,
    );
    healthData.hasSupportService = this.parseBooleanFlag(
      establishment.estabelecimento_possui_servico_apoio,
    );
    healthData.hasOutpatientCare = this.parseBooleanFlag(
      establishment.estabelecimento_possui_atendimento_ambulatorial,
    );

    healthData.teachingActivityCode =
      establishment.codigo_atividade_ensino_unidade || undefined;
    healthData.unitOrganizationNatureCode =
      establishment.codigo_natureza_organizacao_unidade || undefined;
    healthData.unitHierarchyLevelCode =
      establishment.codigo_nivel_hierarquia_unidade || undefined;
    healthData.unitAdministrativeSphereCode =
      establishment.codigo_esfera_administrativa_unidade || undefined;
    healthData.lastUpdateDate = establishment.data_atualizacao || undefined;

    return healthData;
  }

  private buildCnesValidationData(
    establishment: CnesEstablishmentDto,
    cnesCode: string,
    taxId: string,
  ): CnesValidationData {
    const data = new CnesValidationData();
    data.taxId = taxId;
    data.cnesCode = cnesCode;
    data.companyName = establishment.nome_razao_social;
    data.fantasyName = establishment.nome_fantasia;
    return data;
  }

  private isValidInstitution(situation: string): boolean {
    return this.COMPANY_VALID_SITUATIONS.includes(situation?.toUpperCase());
  }

  private mapToInstitutionValidatedDto(
    response: ReceitaWsResponseDto,
    cnesData?: CnesValidatedDto | null,
  ): InstitutionValidatedDto {
    if (!response.success || !response.companyData) {
      return this.buildErrorMessage(response);
    }

    const company = response.companyData;
    const isValid = this.isValidInstitution(company.situacao);

    const result = new InstitutionValidatedDto();
    result.valid = isValid;
    result.data = this.buildInstitutionValidationData(company);

    if (cnesData) {
      result.message = isValid
        ? 'Instituição validada com sucesso - dados de saúde disponíveis'
        : `Instituição encontrada mas com situação irregular: ${company.situacao}`;
    } else {
      result.message = isValid
        ? 'Instituição validada com sucesso'
        : `Instituição com situação irregular: ${company.situacao}`;
    }

    return result;
  }

  private findCompanyRepresentative(
    qsa: CompanyQsaDto[],
  ): CompanyQsaDto | null {
    if (!qsa?.length) return null;
    return qsa.find((member) => member.nome_rep_legal) ?? qsa[0];
  }

  private buildInstitutionValidationData(
    company: CompanyDto,
  ): InstitutionValidationData {
    const qsa = this.findCompanyRepresentative(company.qsa);

    const data = new InstitutionValidationData();
    data.type = company.tipo;
    data.size = company.porte;
    data.name = company.nome;
    data.fantasyName = company.fantasia;
    data.mainActivities = company.atividade_principal?.map(
      (activity) => activity.text,
    );
    data.secondaryActivities = company.atividades_secundarias?.map(
      (activity) => activity.text,
    );
    data.legalNature = company.natureza_juridica;
    data.zipCode = company.cep?.replaceAll(/\D/g, '');
    data.street = company.logradouro;
    data.number = company.numero;
    data.complement = company.complemento;
    data.neighborhood = company.bairro;
    data.city = company.municipio;
    data.state = company.uf;
    data.legalRepresentativeName = qsa?.nome_rep_legal || qsa?.nome;
    data.legalRepresentativeQualification = qsa?.qual_rep_legal || qsa?.qual;
    data.situation = formatToTitleCase(company.situacao);

    return data;
  }

  private buildErrorMessage(
    response: ReceitaWsResponseDto,
  ): InstitutionValidatedDto {
    const result = new InstitutionValidatedDto();
    result.valid = false;
    result.data = null;
    result.message =
      response.error?.message || 'Erro ao consultar dados da empresa';
    return result;
  }
}
