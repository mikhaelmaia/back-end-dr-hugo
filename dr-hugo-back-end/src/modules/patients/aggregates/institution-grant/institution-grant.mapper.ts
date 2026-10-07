import { Injectable } from '@nestjs/common';
import { PatientInstitutionGrant } from '../permission-grant/entities/patient-institution-grant.entity';
import { GrantedInstitutionDetailDto } from './dtos/granted-institution-detail.dto';
import { GrantedInstitutionListItemDto } from './dtos/granted-institution-list-item.dto';

@Injectable()
export class InstitutionGrantMapper {
  public toListItem(
    grant: PatientInstitutionGrant,
  ): GrantedInstitutionListItemDto {
    const dto = new GrantedInstitutionListItemDto();
    dto.grantId = grant.id;
    dto.institutionId = grant.institution?.id;
    dto.name = grant.institution?.user?.name;
    dto.liked = grant.likedByPatient ?? false;
    dto.medicalInstitutionType = grant.institution?.medicalInstitutionType;
    dto.otherMedicalInstitutionType =
      grant.institution?.otherMedicalInstitutionType;
    return dto;
  }

  public toDetail(grant: PatientInstitutionGrant): GrantedInstitutionDetailDto {
    const dto = new GrantedInstitutionDetailDto();
    dto.grantId = grant.id;
    dto.institutionId = grant.institution?.id;
    dto.name = grant.institution?.user?.name;
    dto.liked = grant.likedByPatient ?? false;
    dto.medicalInstitutionType = grant.institution?.medicalInstitutionType;
    dto.otherMedicalInstitutionType =
      grant.institution?.otherMedicalInstitutionType;
    return dto;
  }
}
