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
import { InstitutionValidatedDto } from './dtos/institution-validated.dto';
import { InstitutionValidationDto } from './dtos/institution-validation.dto';
import { CreateInstitutionDto } from './dtos/create-institution.dto';
import { UserService } from '../users/user.service';
import { acceptFalseThrows, whenNullThrows } from 'src/core/utils/functions';
import { Optional } from 'src/core/utils/optional';
import { AddressDto } from 'src/core/modules/address/dtos/address.dto';
import { isNullOrEmpty } from 'src/core/utils/string.utils';

@Injectable()
export class InstitutionService extends BaseService<
  Institution,
  InstitutionDto,
  InstitutionRepository,
  InstitutionMapper
> {
  protected override ENTITY_NOT_FOUND: string = 'Instituição não encontrada';
  private readonly LOOKUP_VALIDATION_IS_MANDATORY_MESSAGE =
    'Validação do CNPJ da instituição é obrigatória. Por favor, realize a consulta antes de criar o cadastro da instituição.';

  public constructor(
    institutionRepository: InstitutionRepository,
    institutionMapper: InstitutionMapper,
    private readonly institutionAdapter: InstitutionAdapter,
    private readonly userService: UserService,
  ) {
    super(institutionRepository, institutionMapper);
  }

  public async lookupTaxId(
    institutionValidation: InstitutionValidationDto,
  ): Promise<InstitutionValidatedDto> {
    return this.institutionAdapter.lookupTaxId(institutionValidation.taxId);
  }

  public async createInstitution(
    institutionDto: CreateInstitutionDto,
  ): Promise<InstitutionDto> {
    const lookedUpValidation = await this.institutionAdapter.getValidation(
      institutionDto.taxId,
    );

    whenNullThrows(
      lookedUpValidation,
      () =>
        new BadRequestException(this.LOOKUP_VALIDATION_IS_MANDATORY_MESSAGE),
    );

    const institution =
      this.mapper.mapValidatedToInstitution(lookedUpValidation);

    const [institutionToCreate, user] =
      this.mapper.mapCreationDtoToEntityAndUser(institutionDto);

    user.name = isNullOrEmpty(lookedUpValidation.data.fantasyName)
      ? lookedUpValidation.data.name
      : lookedUpValidation.data.fantasyName;
    institution.address = institutionToCreate.address;
    institution.cnes = institutionToCreate.cnes;
    institution.medicalInstitutionType =
      institutionToCreate.medicalInstitutionType;
    institution.otherMedicalInstitutionType =
      institutionToCreate.otherMedicalInstitutionType;

    if (institutionToCreate.company?.representative) {
      institution.company.representative =
        institutionToCreate.company.representative;
    }

    institution.clearId();

    const savedUser = await this.userService.create(user);

    institution.user = {
      id: savedUser.id,
      isValid: lookedUpValidation.valid,
    } as any;

    const savedInstitution = await this.repository.save(institution);

    return this.mapper.toDto(savedInstitution);
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
    return await this.findById(institutionId);
  }

  public async updateCurrentUserAddress(
    userId: string,
    addressDto: AddressDto,
  ): Promise<void> {
    await this.findInstitutionIdByUserId(userId);

    const addressEntity = this.mapper.mapAddressDtoToEntity(addressDto);

    const addressData = {
      street: addressEntity.street,
      number: addressEntity.number,
      complement: addressEntity.complement,
      neighborhood: addressEntity.neighborhood,
      city: addressEntity.city,
      state: addressEntity.state,
      zipCode: addressEntity.zipCode,
      country: addressEntity.country,
    };

    await this.repository.updateCurrentUserAddress(userId, addressData);
  }

  public async checkCnesExists(cnes: string): Promise<boolean> {
    return this.repository.existsByCnes(cnes);
  }

  public async refreshCurrentInstitutionData(
    userId: string,
  ): Promise<InstitutionDto> {
    const institutionId = await this.findInstitutionIdByUserId(userId);
    const taxId = await this.repository.findUserTaxIdByUserId(userId);

    const refreshedData =
      await this.institutionAdapter.refreshCompanyData(taxId);

    acceptFalseThrows(
      refreshedData.valid && !!refreshedData.data,
      () =>
        new BadRequestException(
          'Não foi possível atualizar os dados da instituição',
        ),
    );

    const companyEntity = this.mapper.mapValidationDataToCompanyEntity(
      refreshedData.data,
    );
    const addressEntity = this.mapper.mapValidationDataToAddressEntity(
      refreshedData.data,
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

    const resultDto = new InstitutionDto();
    resultDto.id = institutionId;
    resultDto.company = this.mapper.mapCompanyEntityToDto(companyEntity);
    resultDto.address = this.mapper.mapAddressEntityToDto(addressEntity);

    return resultDto;
  }
}
