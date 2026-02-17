import { Injectable } from '@nestjs/common';
import { PatientDocument } from './entities/patient-document.entity';
import { PatientDocumentDto } from './dtos/patient-document.dto';
import { CreatePatientDocumentDto } from './dtos/create-patient-document.dto';

@Injectable()
export class PatientDocumentMapper {
  public toResponse(entity: PatientDocument): PatientDocumentDto {
    const dto = new PatientDocumentDto();

    dto.id = entity.id;
    dto.type = entity.type;
    dto.description = entity.description;
    dto.examDate = entity.examDate;
    dto.requesterName = entity.requesterName;
    dto.examLocation = entity.examLocation;
    dto.observations = entity.observations;
    dto.createdAt = entity.createdAt;

    return dto;
  }

  public toEntity(
    dto: CreatePatientDocumentDto,
    patientId: string,
  ): PatientDocument {
    const entity = new PatientDocument();

    entity.type = dto.type;
    entity.description = dto.description;
    entity.examDate = new Date(dto.examDate);
    entity.requesterName = dto.requesterName;
    entity.examLocation = dto.examLocation;
    entity.observations = dto.observations;

    entity.patient = { id: patientId } as any;
    entity.media = { id: dto.mediaId } as any;

    return entity;
  }
}
