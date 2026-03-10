import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/core/base/base.service';
import { Institution } from './entities/institution.entity';
import { InstitutionDto } from './dtos/institution.dto';
import { InstitutionRepository } from './institution.repository';
import { InstitutionMapper } from './institution.mapper';
import { InstitutionAdapter } from './institution.adapter';
import { CreateInstitutionDto } from './dtos/create-institution.dto';
import {
  InstitutionValidatedDto,
  CnesValidatedDto,
} from './dtos/institution-validated.dto';
import { InstitutionValidationDto } from './dtos/institution-validation.dto';
import { isNullOrEmpty } from 'src/core/utils/string.utils';
import { AddressDto } from 'src/core/modules/address/dtos/address.dto';
import { whenNullThrows, acceptFalseThrows } from 'src/core/utils/functions';
import { UserService } from '../users/user.service';
import { Optional } from 'src/core/utils/optional';
import { CnesValidationDto } from './dtos/cnes-validation.dto';

@Injectable()
export class InstitutionService extends BaseService<
  Institution,
  InstitutionDto,
  InstitutionRepository,
  InstitutionMapper
> {
  protected override ENTITY_NOT_FOUND = 'Instituição não encontrada';

  private readonly CNES_VALIDATION_IS_MANDATORY_MESSAGE =
    'Validação do CNES da instituição é obrigatória. Por favor, realize a consulta antes de criar o cadastro da instituição.';

  private readonly LOOKUP_VALIDATION_IS_MANDATORY_MESSAGE =
    'Validação do CNPJ da instituição é obrigatória. Por favor, realize a consulta antes de criar o cadastro da instituição.';

  public constructor(
    repository: InstitutionRepository,
    mapper: InstitutionMapper,
    private readonly institutionAdapter: InstitutionAdapter,
    private readonly userService: UserService,
  ) {
    super(repository, mapper);
  }

  public async lookupCnes(
    cnesValidation: CnesValidationDto,
  ): Promise<CnesValidatedDto> {
    return this.institutionAdapter.lookupByCnes(cnesValidation.cnes);
  }

  public async lookupTaxId(
    institutionValidation: InstitutionValidationDto,
  ): Promise<InstitutionValidatedDto> {
    return this.institutionAdapter.lookupTaxId(institutionValidation.taxId);
  }

  public async createInstitution(
    dto: CreateInstitutionDto,
  ): Promise<InstitutionDto> {
    const cnesValidation = await this.validateCnes(dto.cnes);

    const institutionValidation = await this.resolveInstitutionValidation(
      dto,
      cnesValidation,
    );

    const institution = this.buildInstitutionBase(
      dto,
      cnesValidation,
      institutionValidation,
    );

    const user = this.buildUser(dto, cnesValidation, institutionValidation);

    const savedUser = await this.userService.create(user);

    institution.user = {
      id: savedUser.id,
      isValid: cnesValidation.valid && (institutionValidation?.valid ?? true),
    } as any;

    const savedInstitution = await this.repository.save(institution);

    return this.mapper.toDto(savedInstitution);
  }

  private async validateCnes(cnes: string): Promise<CnesValidatedDto> {
    const validation = await this.institutionAdapter.getCnesValidation(cnes);

    whenNullThrows(
      validation,
      () => new BadRequestException(this.CNES_VALIDATION_IS_MANDATORY_MESSAGE),
    );

    acceptFalseThrows(
      validation.valid,
      () =>
        new BadRequestException(
          'CNES inválido ou não encontrado. Não é possível criar a instituição.',
        ),
    );

    return validation;
  }

  private async resolveInstitutionValidation(
    dto: CreateInstitutionDto,
    cnesValidation: CnesValidatedDto,
  ): Promise<InstitutionValidatedDto | null> {
    if (cnesValidation.cnpjFound && cnesValidation.basicData?.taxId) {
      return this.institutionAdapter.getValidation(
        cnesValidation.basicData.taxId,
      );
    }

    if (dto.taxId) {
      return this.institutionAdapter.getValidation(dto.taxId);
    }

    return null;
  }

  private buildInstitutionBase(
    dto: CreateInstitutionDto,
    cnesValidation: CnesValidatedDto,
    validation: InstitutionValidatedDto | null,
  ): Institution {
    const institution = validation
      ? this.mapper.mapValidatedToInstitution(validation)
      : new Institution();

    const [institutionFromDto] = this.mapper.mapCreationDtoToEntityAndUser(dto);

    institution.address = institutionFromDto.address;
    institution.cnes = institutionFromDto.cnes;
    institution.medicalInstitutionType =
      institutionFromDto.medicalInstitutionType;
    institution.otherMedicalInstitutionType =
      institutionFromDto.otherMedicalInstitutionType;

    if (cnesValidation.healthData) {
      institution.healthInstitution = this.mapper.mapHealthDataToEntity(
        cnesValidation.healthData,
      );
    }

    if (institutionFromDto.company?.representative) {
      if (institution.company) {
        institution.company.representative =
          institutionFromDto.company.representative;
      } else {
        institution.company = institutionFromDto.company;
      }
    }

    institution.clearId();

    return institution;
  }

  private buildUser(
    dto: CreateInstitutionDto,
    cnesValidation: CnesValidatedDto,
    validation: InstitutionValidatedDto | null,
  ) {
    const [, user] = this.mapper.mapCreationDtoToEntityAndUser(dto);

    user.name = this.resolveInstitutionName(cnesValidation, validation);

    user.taxId = cnesValidation.basicData?.taxId || dto.taxId;

    return user;
  }

  private resolveInstitutionName(
    cnes: CnesValidatedDto,
    validation: InstitutionValidatedDto | null,
  ): string {
    if (cnes.basicData?.fantasyName) {
      return cnes.basicData.fantasyName;
    }

    if (validation && !isNullOrEmpty(validation.data?.fantasyName)) {
      return validation.data.fantasyName;
    }

    return cnes.basicData?.companyName;
  }

  public async findInstitutionIdByUserId(userId: string): Promise<string> {
    return Optional.ofNullable(
      await this.repository.findInstitutionIdByUserId(userId),
    ).orElseThrow(() => new NotFoundException(this.ENTITY_NOT_FOUND));
  }

  public async findInstitutionByUserId(
    userId: string,
  ): Promise<InstitutionDto> {
    const institutionId = await this.findInstitutionIdByUserId(userId);
    return this.findById(institutionId);
  }

  public async updateCurrentUserAddress(
    userId: string,
    addressDto: AddressDto,
  ): Promise<void> {
    await this.findInstitutionIdByUserId(userId);

    const addressEntity = this.mapper.mapAddressDtoToEntity(addressDto);

    await this.repository.updateCurrentUserAddress(userId, {
      street: addressEntity.street,
      number: addressEntity.number,
      complement: addressEntity.complement,
      neighborhood: addressEntity.neighborhood,
      city: addressEntity.city,
      state: addressEntity.state,
      zipCode: addressEntity.zipCode,
      country: addressEntity.country,
    });
  }

  public async refreshCurrentInstitutionData(
    userId: string,
  ): Promise<InstitutionDto> {
    const institutionId = await this.findInstitutionIdByUserId(userId);

    const taxId = await this.repository.findUserTaxIdByUserId(userId);

    const refreshed = await this.institutionAdapter.refreshCompanyData(taxId);

    acceptFalseThrows(
      refreshed.valid && !!refreshed.data,
      () =>
        new BadRequestException(
          'Não foi possível atualizar os dados da instituição',
        ),
    );

    const companyEntity = this.mapper.mapValidationDataToCompanyEntity(
      refreshed.data,
    );

    const addressEntity = this.mapper.mapValidationDataToAddressEntity(
      refreshed.data,
    );

    await this.repository.updateCompanyAndAddressData(
      userId,
      {
        type: companyEntity.type,
        size: companyEntity.size,
        name: companyEntity.name,
        fantasyName: companyEntity.fantasyName,
        mainActivities: companyEntity.mainActivities,
        secondaryActivities: companyEntity.secondaryActivities,
        legalNature: companyEntity.legalNature,
        legalRepresentativeName: companyEntity.legalRepresentativeName,
        legalRepresentativeQualification:
          companyEntity.legalRepresentativeQualification,
      },
      {
        street: addressEntity.street,
        number: addressEntity.number,
        complement: addressEntity.complement,
        neighborhood: addressEntity.neighborhood,
        city: addressEntity.city,
        state: addressEntity.state,
        zipCode: addressEntity.zipCode,
        country: addressEntity.country,
      },
    );

    const dto = new InstitutionDto();
    dto.id = institutionId;
    dto.company = this.mapper.mapCompanyEntityToDto(companyEntity);
    dto.address = this.mapper.mapAddressEntityToDto(addressEntity);

    return dto;
  }
}
