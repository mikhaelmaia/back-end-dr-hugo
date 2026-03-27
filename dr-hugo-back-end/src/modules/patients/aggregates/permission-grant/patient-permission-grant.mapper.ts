import { Injectable } from '@nestjs/common';
import { InstitutionalUserRole } from 'src/core/vo/consts/enums';
import { PatientDoctorGrant } from './entities/patient-doctor-grant.entity';
import { PatientInstitutionGrant } from './entities/patient-institution-grant.entity';
import { PatientPermissionGrantDto } from './dtos/patient-permission-grant.dto';

@Injectable()
export class PatientPermissionGrantMapper {
  public doctorGrantToDto(
    entity: PatientDoctorGrant,
  ): PatientPermissionGrantDto {
    const dto = new PatientPermissionGrantDto();
    dto.id = entity.id;
    dto.patientId = entity.patient?.id;
    dto.granteeId = entity.doctor?.id;
    dto.role = InstitutionalUserRole.DOCTOR;
    dto.documentsIds = entity.documentsIds;
    dto.revokedAt = entity.revokedAt;
    dto.likedByPatient = entity.likedByPatient;
    dto.likedByGrantee = entity.likedByDoctor;
    dto.persistent = entity.persistent;
    dto.allowAccessToAllDocuments = entity.allowAccessToAllDocuments;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  public institutionGrantToDto(
    entity: PatientInstitutionGrant,
  ): PatientPermissionGrantDto {
    const dto = new PatientPermissionGrantDto();
    dto.id = entity.id;
    dto.patientId = entity.patient?.id;
    dto.granteeId = entity.institution?.id;
    dto.role = InstitutionalUserRole.INSTITUTION;
    dto.documentsIds = entity.documentsIds;
    dto.revokedAt = entity.revokedAt;
    dto.likedByPatient = entity.likedByPatient;
    dto.likedByGrantee = entity.likedByInstitution;
    dto.persistent = entity.persistent;
    dto.allowAccessToAllDocuments = entity.allowAccessToAllDocuments;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
