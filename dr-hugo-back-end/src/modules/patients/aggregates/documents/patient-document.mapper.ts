import { Injectable } from '@nestjs/common';
import { PatientDocument } from './entities/patient-document.entity';
import { PatientDocumentDto } from './dtos/patient-document.dto';
import { CreatePatientDocumentDto } from './dtos/create-patient-document.dto';
import { PatientDocumentMedia } from './entities/patient-document-media.entity';
import { PatientDocumentMediaDto } from './dtos/patient-document-media.dto';
import { MediaMapper } from 'src/core/modules/media/media.mapper';
import { dateToBrazilianString } from 'src/core/utils/date-time.utils';

@Injectable()
export class PatientDocumentMapper {
  constructor(private readonly mediaMapper: MediaMapper) {}
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

    dto.mediaIds = entity.medias?.map((m) => m.media.id) ?? [];
    dto.medias = entity.medias?.map((m) => this.toMediaDto(m)) ?? [];

    return dto;
  }

  public toEntity(
    dto: CreatePatientDocumentDto,
    patientId: string,
  ): PatientDocument {
    const entity = new PatientDocument();

    entity.type = dto.type;
    entity.description = dto.description;

    const examDate = new Date(dto.examDate);
    entity.examDate = examDate;

    entity.examMonth = this.buildExamMonth(examDate);

    entity.requesterName = dto.requesterName;
    entity.examLocation = dto.examLocation;
    entity.observations = dto.observations;

    entity.patient = { id: patientId } as any;

    entity.medias = dto.mediaIds.map((mediaId, index) => {
      const documentMedia = new PatientDocumentMedia();

      documentMedia.media = { id: mediaId } as any;
      documentMedia.order = index;

      return documentMedia;
    });

    return entity;
  }

  public toUpdateData(dto: PatientDocumentDto): Partial<PatientDocument> {
    const examDate = new Date(dto.examDate);

    return {
      type: dto.type,
      description: dto.description,
      examDate,
      examMonth: this.buildExamMonth(examDate),
      requesterName: dto.requesterName,
      examLocation: dto.examLocation,
      observations: dto.observations,
    };
  }

  public toListItem(entity: PatientDocument) {
    return {
      id: entity.id,
      description: entity.description,
      examDate: dateToBrazilianString(entity.examDate),
    };
  }

  private toMediaDto(
    documentMedia: PatientDocumentMedia,
  ): PatientDocumentMediaDto {
    const dto = new PatientDocumentMediaDto();
    dto.media = this.mediaMapper.toDto(documentMedia.media);
    dto.order = documentMedia.order;
    dto.isPrimary = documentMedia.isPrimary;
    return dto;
  }

  private buildExamMonth(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
