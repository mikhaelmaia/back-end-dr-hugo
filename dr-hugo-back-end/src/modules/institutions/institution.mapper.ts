import { Injectable } from "@nestjs/common";
import { BaseMapper } from "src/core/base/base.mapper";
import { Institution } from "./entities/institution.entity";
import { InstitutionDto } from "./dtos/institution.dto";
import { CreateInstitutionDto } from "./dtos/create-institution.dto";
import { UserDto } from "../users/dtos/user.dto";
import { UserRole, BrazilianState } from "src/core/vo/consts/enums";
import { InstitutionValidatedDto, InstitutionValidationData } from "./dtos/institution-validated.dto";
import { InstitutionCompany } from "./aggregates/company/entities/company.entity";
import { InstitutionCompanyRepresentative } from "./aggregates/representative/entities/representative.entity";
import { AddressDto } from "src/core/modules/address/dtos/address.dto";
import { Address } from "src/core/modules/address/entities/address.entity";
import { findEnumByKeyValue } from "src/core/utils/enum.utils";
import { CreateInstitutionCompanyRepresentativeDto } from "./aggregates/representative/dtos/create-representative.dto";

@Injectable()
export class InstitutionMapper extends BaseMapper<Institution, InstitutionDto> {

    public toDto(entity: Institution): InstitutionDto {
        throw new Error("Method not implemented.");
    }

    public toEntity(dto: Partial<InstitutionDto>): Institution {
        throw new Error("Method not implemented.");
    }

    public mapCreationDtoToEntityAndUser(dto: CreateInstitutionDto): [Institution, UserDto] {
        const entity = new Institution();
        
        entity.cnes = dto.cnes;
        entity.medicalInstitutionType = dto.medicalInstitutionType;
        entity.otherMedicalInstitutionType = dto.otherMedicalInstitutionType;
        
        if (dto.address) {
            entity.address = this.mapAddressDtoToEntity(dto.address);
        }

        entity.company = new InstitutionCompany();

        entity.company.representative = this.mapCreateRepresentativeDtoToEntity(dto.representative);

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

    public mapValidatedToInstitution(institutionValidatedDto: InstitutionValidatedDto): Institution {
        const institutionData = institutionValidatedDto.data;

        const institution = new Institution();
        
        const company = this.mapValidationDataToCompanyEntity(institutionData);
        institution.company = company;

        const address = this.mapValidationDataToAddressEntity(institutionData);
        institution.address = address;

        return institution;
    }

    public mapValidationDataToCompanyEntity(validationData: InstitutionValidationData): InstitutionCompany {
        const company = new InstitutionCompany();
        
        company.name = validationData.name;
        company.fantasyName = validationData.fantasyName;
        company.size = validationData.size;
        company.mainActivities = validationData.mainActivities;
        company.secondaryActivities = validationData.secondaryActivities;
        company.legalNature = validationData.legalNature;
        company.legalRepresentativeName = validationData.legalRepresentativeName;
        company.legalRepresentativeQualification = validationData.legalRepresentativeQualification;
        
        return company;
    }

    public mapValidationDataToAddressEntity(validationData: InstitutionValidationData): Address {
        const address = new Address();
        
        address.zipCode = validationData.zipCode;
        address.street = validationData.street;
        address.number = validationData.number;
        address.complement = validationData.complement;
        address.neighborhood = validationData.neighborhood;
        address.city = validationData.city;
        address.state = findEnumByKeyValue(BrazilianState, validationData.state);
        
        return address;
    }

    public mapAddressDtoToEntity(addressDto: AddressDto): Address {
        const address = new Address();
        
        address.zipCode = addressDto.zipCode;
        address.street = addressDto.street;
        address.number = addressDto.number;
        address.complement = addressDto.complement;
        address.neighborhood = addressDto.neighborhood;
        address.city = addressDto.city;
        address.state = addressDto.state;
        address.country = addressDto.country;
        
        return address;
    }

    public mapCreateRepresentativeDtoToEntity(representativeDto: CreateInstitutionCompanyRepresentativeDto): InstitutionCompanyRepresentative {
        const representative = new InstitutionCompanyRepresentative();
        
        representative.name = representativeDto.name;
        representative.taxId = representativeDto.taxId;
        representative.crm = representativeDto.crm;
        representative.state = representativeDto.state;

        return representative;
    }

}