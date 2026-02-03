import { Inject, Injectable } from '@nestjs/common';
import {
  CACHE_SERVICE,
  CacheService,
} from 'src/core/modules/cache/cache.service';
import { ReceitaWsService } from 'src/core/modules/external/receitaws/receitaws.service';
import {
  InstitutionValidatedDto,
  InstitutionValidationData,
} from './dtos/institution-validated.dto';
import {
  CompanyDto,
  CompanyQsaDto,
  ReceitaWsResponseDto,
} from 'src/core/modules/external/receitaws/dto/company.dto';
import { formatToTitleCase } from 'src/core/utils/format.utils';

@Injectable()
export class InstitutionAdapter {
  private readonly CACHE_KEY_PREFIX = 'institution-validation-';
  private readonly VALIDATION_TTL_SECONDS = 3600;
  private readonly COMPANY_VALID_SITUATIONS: string[] = ['ATIVA', 'ATIVO'];

  constructor(
    private readonly receitaWsService: ReceitaWsService,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: CacheService,
  ) {}

  public async lookupTaxId(taxId: string): Promise<InstitutionValidatedDto> {
    const response = await this.receitaWsService.getCompanyByTaxId(taxId);
    const institutionValidated = this.mapToInstitutionValidatedDto(response);
    await this.cacheService.set(
      `${this.CACHE_KEY_PREFIX}${taxId}`,
      institutionValidated,
      this.VALIDATION_TTL_SECONDS,
    );
    return institutionValidated;
  }

  public async getValidation(
    taxId: string,
  ): Promise<InstitutionValidatedDto | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${taxId}`;

    const cachedData =
      await this.cacheService.get<InstitutionValidatedDto>(cacheKey);

    return cachedData || null;
  }

  private isValidInstitution(situation: string): boolean {
    return this.COMPANY_VALID_SITUATIONS.includes(situation?.toUpperCase());
  }

  private mapToInstitutionValidatedDto(
    response: ReceitaWsResponseDto,
  ): InstitutionValidatedDto {
    if (!response.success || !response.companyData)
      return this.buildErrorMessage(response);

    const company = response.companyData;
    const isValid = this.isValidInstitution(company.situacao);

    const result = new InstitutionValidatedDto();
    result.valid = isValid;
    result.data = this.buildInstitutionValidationData(company);
    result.message = isValid
      ? 'Instituição validada com sucesso'
      : `Instituição com situação irregular: ${company.situacao}`;

    return result;
  }

  private findCompanyRepresentative(qsa: CompanyQsaDto[]): CompanyQsaDto {
    return qsa.find((member) => member.nome_rep_legal) || qsa[0];
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
