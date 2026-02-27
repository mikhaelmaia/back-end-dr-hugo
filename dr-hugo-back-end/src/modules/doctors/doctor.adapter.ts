import { Inject, Injectable } from '@nestjs/common';
import {
  CACHE_SERVICE,
  CacheService,
} from 'src/core/modules/cache/cache.service';
import { CfmService } from 'src/core/modules/external/cfm/cfm.service';
import {
  DoctorRegistrationValidatedDto,
  DoctorRegistrationData,
} from './dtos/doctor-registration-validated.dto';
import { DoctorRegistrationValidationDto } from './dtos/doctor-registration-validation.dto';
import {
  CfmServiceResponse,
  CfmDoctorData,
} from 'src/core/modules/external/cfm/dtos/cfm.dtos';
import {
  DoctorRegistrationType,
  DoctorSituation,
  DoctorSpecializationType,
} from 'src/core/vo/consts/enums';
import {
  findEnumValueByKeyOrValue,
  findEnumKeyByValue,
} from 'src/core/utils/enum.utils';
import { DoctorSpecializationDto } from './aggregates/specialization/dtos/doctor-specialization.dto';

@Injectable()
export class DoctorAdapter {
  private readonly CACHE_KEY_PREFIX = 'doctor-validation';
  private readonly VALIDATION_TTL_SECONDS = 3600;

  private readonly VALID_DOCTOR_SITUATIONS: string[] = [
    'A', // Ativo
  ];

  constructor(
    private readonly cfmService: CfmService,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: CacheService,
  ) {}

  public async lookupRegistration(
    request: DoctorRegistrationValidationDto,
  ): Promise<DoctorRegistrationValidatedDto> {
    const cacheKey = this.buildCacheKey(request.taxId);

    const response = await this.cfmService.consultDoctor({
      crm: Number(request.crm),
      uf: request.state,
    });

    let validated = this.mapToValidatedDto(response, request);

    await this.cacheService.set(
      cacheKey,
      validated,
      this.VALIDATION_TTL_SECONDS,
    );

    const data = {
      ...validated.data,
      specialties: validated.data?.specialties?.filter((s) => s.isActive),
    };

    validated = {
      ...validated,
      data,
    };

    return validated;
  }

  public async getLookedRegistration(
    taxId: string,
  ): Promise<DoctorRegistrationValidatedDto | null> {
    return this.cacheService.get(this.buildCacheKey(taxId));
  }

  public async refreshRegistrationData(
    request: DoctorRegistrationValidationDto,
  ): Promise<DoctorRegistrationValidatedDto> {
    const response = await this.cfmService.consultDoctor({
      crm: Number(request.crm),
      uf: request.state,
    });

    if (!response.success || !response.doctorData) {
      return this.buildErrorResult(response);
    }

    const doctor = response.doctorData;

    const cfmSpecialties = this.parseCfmSpecialties(doctor.especialidades);

    return {
      valid: true,
      data: {
        name: doctor.nome,
        situation: this.mapExternalSituationToInternal(doctor.situacao),
        type: this.mapExternalTypeToInternal(doctor.tipoInscricao),
        lastUpdate: doctor.dataAtualizacao,
        cfmSpecialties: cfmSpecialties.map((s) => s.name),

        taxId: request.taxId,
        crm: request.crm,
        state: request.state,
        isGeneralist: cfmSpecialties.length === 0,
        specialties: cfmSpecialties.map((s, index) => {
          const dto = new DoctorSpecializationDto();
          dto.name = findEnumValueByKeyOrValue(
            DoctorSpecializationType,
            s.name,
          );
          dto.rqe = s.rqe;
          dto.isActive = index < 2;
          return dto;
        }),
      },
      messages: ['Dados sincronizados com sucesso'],
    };
  }

  private mapToValidatedDto(
    response: CfmServiceResponse<CfmDoctorData>,
    request: DoctorRegistrationValidationDto,
  ): DoctorRegistrationValidatedDto {
    if (!response.success || !response.doctorData) {
      return this.buildErrorResult(response);
    }

    const doctor = response.doctorData;
    const validationErrors: string[] = [];

    const cfmSpecialties = this.parseCfmSpecialties(doctor.especialidades);

    const situationValid = this.isSituationValid(doctor.situacao);
    if (!situationValid) {
      validationErrors.push('Registro médico com situação irregular no CFM');
    }

    const generalistConsistent = this.isGeneralistConsistent(
      request,
      cfmSpecialties.map((s) => s.name),
    );
    if (!generalistConsistent) {
      if (request.isGeneralist && cfmSpecialties.length > 0) {
        validationErrors.push(
          'Médico se declara generalista mas possui especialidades registradas no CFM',
        );
      } else if (
        request.isGeneralist &&
        request.specialties &&
        request.specialties.length > 0
      ) {
        validationErrors.push(
          'Médico generalista não pode informar especialidades',
        );
      }
    }

    if (!request.isGeneralist) {
      const specialtyValidation = this.validateSpecialtiesDetailed(
        cfmSpecialties,
        request,
      );
      if (!specialtyValidation.valid) {
        validationErrors.push(...specialtyValidation.errors);
      }
    }

    const isValid = validationErrors.length === 0;

    return {
      valid: isValid,
      data: this.buildDoctorRegistrationData(doctor, request, cfmSpecialties),
      messages: isValid
        ? ['Registro médico validado com sucesso']
        : validationErrors,
    };
  }

  private parseCfmSpecialties(
    rawSpecialties: string[],
  ): { name: string; rqe?: string }[] {
    const specialties: { name: string; rqe?: string }[] = [];

    for (const specialty of rawSpecialties) {
      const groups = specialty.split('|').map((s) => s.trim());

      for (const group of groups) {
        const withoutSubs = group.replaceAll(/\([^)]*\)/g, '').trim();

        const nameRegex = /^([^-]+?)(?:\s*-\s*RQE|$)/;
        const nameMatch = nameRegex.exec(withoutSubs);
        if (!nameMatch) continue;

        const rawName = nameMatch[1].trim();

        const enumValue = findEnumValueByKeyOrValue(
          DoctorSpecializationType,
          rawName,
        );
        const specialtyName = enumValue || this.normalizeSpecialtyName(rawName);

        if (specialtyName.length === 0) continue;

        const rqeRegex = /RQE\s*Nº\s*:?\s*(\d+)/i;
        const rqeMatch = rqeRegex.exec(group);
        const rqe = rqeMatch ? rqeMatch[1] : undefined;

        specialties.push({
          name: specialtyName,
          ...(rqe && { rqe }),
        });
      }
    }

    const unique = specialties.filter(
      (specialty, index, array) =>
        array.findIndex((s) => s.name === specialty.name) === index,
    );

    return unique;
  }

  private normalizeSpecialtyName(specialty: string): string {
    return specialty.trim().replaceAll(/\s+/g, ' ').toUpperCase();
  }

  private isSituationValid(situation: string): boolean {
    return this.VALID_DOCTOR_SITUATIONS.includes(situation);
  }

  private isGeneralistConsistent(
    request: DoctorRegistrationValidationDto,
    cfmSpecialtyNames: string[],
  ): boolean {
    if (!request.isGeneralist) {
      return true;
    }

    const hasUserSpecialties =
      request.specialties && request.specialties.length > 0;
    const hasCfmSpecialties = cfmSpecialtyNames.length > 0;

    return !hasUserSpecialties && !hasCfmSpecialties;
  }

  private validateSpecialtiesDetailed(
    cfmSpecialties: { name: string; rqe?: string }[],
    request: DoctorRegistrationValidationDto,
  ): { valid: boolean; errors: string[] } {
    if (!request.specialties || request.specialties.length === 0) {
      return {
        valid: false,
        errors: ['Especialidades não informadas pelo usuário'],
      };
    }

    if (request.specialties.length > 2) {
      return {
        valid: false,
        errors: [
          'Máximo de 2 especialidades permitidas por restrições de propaganda médica',
        ],
      };
    }

    if (cfmSpecialties.length === 0) {
      return {
        valid: false,
        errors: ['Nenhuma especialidade encontrada no registro do CFM'],
      };
    }

    const invalidSpecialties: string[] = [];

    for (const userSpecialty of request.specialties) {
      const expectedName = DoctorSpecializationType[userSpecialty.name];

      const isValid = cfmSpecialties.some((cfmSpecialty) => {
        const nameMatches = this.specialtyNamesMatch(
          expectedName,
          cfmSpecialty.name,
        );

        if (nameMatches && userSpecialty.rqe && cfmSpecialty.rqe) {
          return cfmSpecialty.rqe === userSpecialty.rqe;
        }

        return nameMatches;
      });

      if (!isValid) {
        const displayName = userSpecialty.rqe
          ? `${expectedName} (RQE: ${userSpecialty.rqe})`
          : expectedName;
        invalidSpecialties.push(displayName);
      }
    }

    if (invalidSpecialties.length > 0) {
      return {
        valid: false,
        errors: [
          `Especialidades informadas não encontradas no registro do CFM: ${invalidSpecialties.join(', ')}`,
        ],
      };
    }

    return { valid: true, errors: [] };
  }

  private specialtyNamesMatch(expectedName: string, cfmName: string): boolean {
    const normalizedExpected = this.normalizeSpecialtyName(expectedName);
    const normalizedCfm = this.normalizeSpecialtyName(cfmName);

    return (
      normalizedCfm === normalizedExpected ||
      normalizedCfm.includes(normalizedExpected) ||
      normalizedExpected.includes(normalizedCfm) ||
      cfmName === expectedName
    );
  }

  private buildDoctorRegistrationData(
    doctor: CfmDoctorData,
    request: DoctorRegistrationValidationDto,
    cfmSpecialties: { name: string; rqe?: string }[],
  ): DoctorRegistrationData {
    const allSpecialties = this.buildAllSpecialtiesWithStatus(
      cfmSpecialties,
      request.specialties || [],
    );

    return {
      name: doctor.nome,
      situation: this.mapExternalSituationToInternal(doctor.situacao),
      type: this.mapExternalTypeToInternal(doctor.tipoInscricao),
      lastUpdate: doctor.dataAtualizacao,
      cfmSpecialties: cfmSpecialties.map((s) => s.name),

      taxId: request.taxId,
      crm: request.crm,
      state: request.state,
      isGeneralist: request.isGeneralist,
      specialties: allSpecialties,
    };
  }

  private buildAllSpecialtiesWithStatus(
    cfmSpecialties: { name: string; rqe?: string }[],
    userSpecialties: any[],
  ): any[] {
    const allSpecialties: any[] = [];
    for (const userSpec of userSpecialties) {
      allSpecialties.push({
        name: userSpec.name,
        rqe: userSpec.rqe,
        isActive: true,
      });
    }

    for (const cfmSpec of cfmSpecialties) {
      const cfmSpecName = cfmSpec.name;

      const isUserSpecialty = userSpecialties.some((userSpec) => {
        const userSpecValue = DoctorSpecializationType[userSpec.name];
        return this.specialtyNamesMatch(userSpecValue, cfmSpecName);
      });

      if (!isUserSpecialty) {
        const enumKey = findEnumKeyByValue(
          DoctorSpecializationType,
          cfmSpecName,
        );

        allSpecialties.push({
          name: enumKey || cfmSpecName,
          rqe: cfmSpec.rqe,
          isActive: false,
        });
      }
    }

    return allSpecialties;
  }

  private mapExternalSituationToInternal(
    situation: string,
  ): DoctorSituation | null {
    switch (situation.toUpperCase()) {
      case 'A':
        return DoctorSituation.REGULAR;
      case 'B':
        return DoctorSituation.SUSPENSAO_PARCIAL_PERMANENTE;
      case 'C':
        return DoctorSituation.CASSADO;
      case 'E':
        return DoctorSituation.INOPERANTE;
      case 'F':
        return DoctorSituation.FALECIDO;
      case 'G':
        return DoctorSituation.SEM_EXERCICIO_UF;
      case 'I':
        return DoctorSituation.INTERDICAO_CAUTELAR_TOTAL;
      case 'J':
        return DoctorSituation.SUSPENSO_ORDEM_JUDICIAL_PARCIAL;
      case 'L':
        return DoctorSituation.CANCELADO;
      case 'M':
        return DoctorSituation.SUSPENSAO_TOTAL_TEMPORARIA;
      case 'N':
        return DoctorSituation.INTERDICAO_CAUTELAR_PARCIAL;
      case 'O':
        return DoctorSituation.SUSPENSO_ORDEM_JUDICIAL_TOTAL;
      case 'P':
        return DoctorSituation.APOSENTADO;
      case 'R':
        return DoctorSituation.SUSPENSAO_TEMPORARIA;
      case 'S':
        return DoctorSituation.SUSPENSO_TOTAL;
      case 'T':
        return DoctorSituation.TRANSFERIDO;
      case 'X':
        return DoctorSituation.SUSPENSO_PARCIAL;
      default:
        return null;
    }
  }

  private mapExternalTypeToInternal(
    type: string,
  ): DoctorRegistrationType | null {
    switch (type.toUpperCase()) {
      case 'P':
        return DoctorRegistrationType.PRINCIPAL;
      case 'S':
        return DoctorRegistrationType.SECUNDARIA;
      case 'V':
        return DoctorRegistrationType.PROVISORIA;
      case 'T':
        return DoctorRegistrationType.TEMPORARIA;
      case 'E':
        return DoctorRegistrationType.ESTUDANTE_ESTRANGEIRO;
      default:
        return null;
    }
  }

  private buildErrorResult(
    response: CfmServiceResponse<CfmDoctorData>,
  ): DoctorRegistrationValidatedDto {
    return {
      valid: false,
      data: null,
      messages: [
        response.error?.message || 'Erro ao consultar dados do médico no CFM',
      ],
    };
  }

  private buildCacheKey(taxId: string): string {
    return `${this.CACHE_KEY_PREFIX}:${taxId}`;
  }
}
