import { Injectable } from '@nestjs/common';
import { BaseMapper } from 'src/core/base/base.mapper';
import { Institution } from './entities/institution.entity';
import { InstitutionDto } from './dtos/institution.dto';
import { CreateInstitutionDto } from './dtos/create-institution.dto';
import { UserDto } from '../users/dtos/user.dto';
import {
  UserRole,
  BrazilianState,
  CompanyType,
} from 'src/core/vo/consts/enums';
import {
  InstitutionValidatedDto,
  InstitutionValidationData,
  HealthInstitutionData,
} from './dtos/institution-validated.dto';
import { InstitutionCompany } from './aggregates/company/entities/company.entity';
import { InstitutionCompanyRepresentative } from './aggregates/representative/entities/representative.entity';
import { AddressDto } from 'src/core/modules/address/dtos/address.dto';
import { Address } from 'src/core/modules/address/entities/address.entity';
import {
  findEnumByKeyValue,
  findEnumValueByKeyOrValue,
} from 'src/core/utils/enum.utils';
import { CreateInstitutionCompanyRepresentativeDto } from './aggregates/representative/dtos/create-representative.dto';
import { CompanyDto } from './aggregates/company/dtos/company.dto';
import { RepresentativeDto } from './aggregates/representative/dtos/representative.dto';
import { HealthInstitution } from './aggregates/health/entities/health-institution.entity';
import { stringToLocalDate } from 'src/core/utils/date-time.utils';
import { UserMapper } from '../users/user.mapper';
import { CryptoService } from 'src/core/modules/crypto/crypto.service';

@Injectable()
export class InstitutionMapper extends BaseMapper<Institution, InstitutionDto> {
  public constructor(
    private readonly userMapper: UserMapper,
    private readonly cryptoService: CryptoService,
  ) {
    super();
  }

  public toDto(entity: Institution): InstitutionDto {
    const dto = new InstitutionDto();

    dto.id = entity.id;
    dto.cnes = entity.cnes;
    dto.medicalInstitutionType = entity.medicalInstitutionType;
    dto.otherMedicalInstitutionType = entity.otherMedicalInstitutionType;

    if (entity.user) {
      const userDto = this.userMapper.toDto(entity.user);
      dto.name = userDto.name;
      dto.taxId = userDto.taxId;
      dto.role = userDto.role;
      dto.email = userDto.email;
      dto.countryCode = userDto.countryCode;
      dto.countryIdd = userDto.countryIdd;
      dto.phone = userDto.phone;
      dto.acceptedTerms = userDto.acceptedTerms;
      dto.profilePictureId = entity.user.profilePicture?.id || null;
    }

    if (entity.address) {
      dto.address = this.mapAddressEntityToDto(entity.address);
    }

    if (entity.company) {
      dto.company = this.mapCompanyEntityToDto(entity.company);
    }

    return dto;
  }

  public toEntity(dto: Partial<InstitutionDto>): Institution {
    throw new Error('Method not implemented.');
  }

  public mapCreationDtoToEntityAndUser(
    dto: CreateInstitutionDto,
  ): [Institution, UserDto] {
    const entity = new Institution();

    entity.cnes = dto.cnes;
    entity.medicalInstitutionType = dto.medicalInstitutionType;
    entity.otherMedicalInstitutionType = dto.otherMedicalInstitutionType;

    if (dto.address) {
      entity.address = this.mapAddressDtoToEntity(dto.address);
    }

    entity.company = new InstitutionCompany();

    entity.company.representative = this.mapCreateRepresentativeDtoToEntity(
      dto.representative,
    );

    const user = new UserDto();
    user.email = dto.email;
    user.password = dto.password;
    user.taxId = dto.taxId;
    user.phone = dto.phone;
    user.countryCode = dto.countryCode;
    user.countryIdd = dto.countryIdd;
    user.role = UserRole.INSTITUTION;
    user.acceptedTerms = dto.acceptedTerms;

    return [entity, user];
  }

  public mapValidatedToInstitution(
    institutionValidatedDto: InstitutionValidatedDto,
  ): Institution {
    const institutionData = institutionValidatedDto.data;

    const institution = new Institution();

    const company = this.mapValidationDataToCompanyEntity(institutionData);
    institution.company = company;

    const address = this.mapValidationDataToAddressEntity(institutionData);
    institution.address = address;

    return institution;
  }

  public mapValidationDataToCompanyEntity(
    validationData: InstitutionValidationData,
  ): InstitutionCompany {
    const company = new InstitutionCompany();

    company.name = validationData.name;
    company.type = findEnumValueByKeyOrValue(CompanyType, validationData.type);
    company.fantasyName = validationData.fantasyName;
    company.size = validationData.size;
    company.mainActivities = validationData.mainActivities;
    company.secondaryActivities = validationData.secondaryActivities;
    company.legalNature = validationData.legalNature;
    company.legalRepresentativeName = validationData.legalRepresentativeName;
    company.legalRepresentativeQualification =
      validationData.legalRepresentativeQualification;

    return company;
  }

  public mapValidationDataToAddressEntity(
    validationData: InstitutionValidationData,
  ): Address {
    const address = new Address();

    address.zipCode = this.cryptoService.encrypt(validationData.zipCode);
    address.street = this.cryptoService.encrypt(validationData.street);
    address.number = this.cryptoService.encrypt(validationData.number);
    address.complement = validationData.complement
      ? this.cryptoService.encrypt(validationData.complement)
      : null;
    address.neighborhood = this.cryptoService.encrypt(validationData.neighborhood);
    address.city = this.cryptoService.encrypt(validationData.city);
    address.state = findEnumByKeyValue(BrazilianState, validationData.state);

    return address;
  }

  public mapAddressDtoToEntity(addressDto: AddressDto): Address {
    const address = new Address();

    address.zipCode = this.cryptoService.encrypt(addressDto.zipCode);
    address.street = this.cryptoService.encrypt(addressDto.street);
    address.number = this.cryptoService.encrypt(addressDto.number);
    address.complement = addressDto.complement
      ? this.cryptoService.encrypt(addressDto.complement)
      : null;
    address.neighborhood = this.cryptoService.encrypt(addressDto.neighborhood);
    address.city = this.cryptoService.encrypt(addressDto.city);
    address.state = addressDto.state;
    address.country = addressDto.country;

    return address;
  }

  public mapCreateRepresentativeDtoToEntity(
    representativeDto: CreateInstitutionCompanyRepresentativeDto,
  ): InstitutionCompanyRepresentative {
    const representative = new InstitutionCompanyRepresentative();

    representative.name = this.cryptoService.encrypt(representativeDto.name);
    representative.taxId = this.cryptoService.encrypt(representativeDto.taxId);
    representative.crm = representativeDto.crm;
    representative.state = representativeDto.state;

    return representative;
  }

  public mapAddressEntityToDto(entity: Address): AddressDto {
    const dto = new AddressDto();

    dto.id = entity.id;
    dto.street = entity.street ? this.cryptoService.decrypt(entity.street) : entity.street;
    dto.number = entity.number ? this.cryptoService.decrypt(entity.number) : entity.number;
    dto.complement = entity.complement ? this.cryptoService.decrypt(entity.complement) : entity.complement;
    dto.neighborhood = entity.neighborhood ? this.cryptoService.decrypt(entity.neighborhood) : entity.neighborhood;
    dto.city = entity.city ? this.cryptoService.decrypt(entity.city) : entity.city;
    dto.state = entity.state;
    dto.zipCode = entity.zipCode ? this.cryptoService.decrypt(entity.zipCode) : entity.zipCode;
    dto.country = entity.country;

    return dto;
  }

  public mapCompanyEntityToDto(entity: InstitutionCompany): CompanyDto {
    const dto = new CompanyDto();

    dto.id = entity.id;
    dto.name = entity.name;
    dto.type = entity.type;
    dto.fantasyName = entity.fantasyName;
    dto.size = entity.size;
    dto.mainActivities = entity.mainActivities;
    dto.secondaryActivities = entity.secondaryActivities;
    dto.legalNature = entity.legalNature;
    dto.legalRepresentativeName = entity.legalRepresentativeName;
    dto.legalRepresentativeQualification =
      entity.legalRepresentativeQualification;

    if (entity.representative) {
      dto.representative = this.mapRepresentativeEntityToDto(
        entity.representative,
      );
    }

    return dto;
  }

  public mapRepresentativeEntityToDto(
    entity: InstitutionCompanyRepresentative,
  ): RepresentativeDto {
    const dto = new RepresentativeDto();

    dto.id = entity.id;
    dto.name = entity.name ? this.cryptoService.decrypt(entity.name) : entity.name;
    dto.taxId = entity.taxId ? this.cryptoService.decrypt(entity.taxId) : entity.taxId;
    dto.crm = entity.crm;
    dto.state = entity.state;

    return dto;
  }

  public mapHealthDataToEntity(
    healthData: HealthInstitutionData,
  ): HealthInstitution {
    const entity = new HealthInstitution();

    entity.organizationNature = healthData.organizationNature;
    entity.legalNatureDescription = healthData.legalNatureDescription;
    entity.disablingReasonCode = healthData.disablingReasonCode;
    entity.hasSurgicalCenter = healthData.hasSurgicalCenter;
    entity.hasObstetricCenter = healthData.hasObstetricCenter;
    entity.hasNeonatalCenter = healthData.hasNeonatalCenter;
    entity.hasHospitalCare = healthData.hasHospitalCare;
    entity.hasSupportService = healthData.hasSupportService;
    entity.hasOutpatientCare = healthData.hasOutpatientCare;
    entity.teachingActivityCode = healthData.teachingActivityCode;
    entity.unitOrganizationNatureCode = healthData.unitOrganizationNatureCode;
    entity.unitHierarchyLevelCode = healthData.unitHierarchyLevelCode;
    entity.unitAdministrativeSphereCode =
      healthData.unitAdministrativeSphereCode;

    if (healthData.lastUpdateDate) {
      entity.lastUpdateDate = stringToLocalDate(healthData.lastUpdateDate);
    }

    return entity;
  }
}
