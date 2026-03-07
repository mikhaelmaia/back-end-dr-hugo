import { Injectable, NotFoundException } from '@nestjs/common';
import { PatientDocumentRepository } from './patient-document.repository';
import { PatientDocumentMapper } from './patient-document.mapper';
import { PatientsService } from '../../patients.service';
import { CreatePatientDocumentDto } from './dtos/create-patient-document.dto';
import { PatientDocumentDto } from './dtos/patient-document.dto';
import { MediaStreamResult, PaginationParams } from 'src/core/vo/types/types';
import { PatientDocument } from './entities/patient-document.entity';
import { MediaService } from 'src/core/modules/media/media.service';
import { PatientDocumentListItemDto } from './dtos/patient-document-list-item.dto';
import { PatientDocumentAvailableFiltersDto } from './dtos/patient-document-available-filters.dto';
import { acceptFalseThrows } from 'src/core/utils/functions';
import { TuusCategoryService } from 'src/core/modules/domain/tuus-category/tuus-category.service';
import { PatientDocumentType } from 'src/core/vo/consts/enums';
import { PatientDocumentPaginatedDto } from './dtos/patient-document-paginated.dto';
import { formatMonthYearToBrazilian } from 'src/core/utils/date-time.utils';

@Injectable()
export class PatientDocumentService {
  constructor(
    private readonly repository: PatientDocumentRepository,
    private readonly mapper: PatientDocumentMapper,
    private readonly patientService: PatientsService,
    private readonly mediaService: MediaService,
    private readonly tuusCategoryService: TuusCategoryService,
  ) {}

  public async create(
    userId: string,
    dto: CreatePatientDocumentDto,
    patientId?: string,
  ): Promise<PatientDocumentDto> {
    const resolvedPatientId = await this.resolvePatientId(userId, patientId);

    await this.mediaService.validateOwnership(dto.mediaIds, userId);

    const entity = this.mapper.toEntity(dto, resolvedPatientId);
    await this.enrichEntityWithTussData(dto.type, dto.description, entity);

    const saved = await this.repository.save(entity);

    return this.mapper.toResponse(saved);
  }

  public async findMonthly(
    userId: string,
    params: PaginationParams<PatientDocument>,
    patientId?: string,
  ): Promise<PatientDocumentPaginatedDto> {
    const resolvedPatientId = await this.resolvePatientId(userId, patientId);

    const { grouped, totalItems, totalPages, page } =
      await this.repository.findPaginatedGroupedByMonth(
        resolvedPatientId,
        params,
      );

    const mapped: Record<string, PatientDocumentListItemDto[]> = {};

    Object.entries(grouped).forEach(([month, docs]) => {
      const formattedMonth = formatMonthYearToBrazilian(month);
      mapped[formattedMonth] = docs.map((doc) => this.mapper.toListItem(doc));
    });

    return {
      items: mapped,
      totalItems,
      currentPage: page,
      totalPages,
    };
  }

  public async findAvailableFilters(
    userId: string,
    patientId?: string,
  ): Promise<PatientDocumentAvailableFiltersDto> {
    const resolvedPatientId = await this.resolvePatientId(userId, patientId);
    return await this.repository.findAvailableFilters(resolvedPatientId);
  }

  public async findById(
    userId: string,
    documentId: string,
    patientId?: string,
  ): Promise<PatientDocumentDto> {
    const resolvedPatientId = await this.resolvePatientId(userId, patientId);

    const document = await this.repository.findByIdAndPatientId(
      documentId,
      resolvedPatientId,
    );

    await this.validateDocumentExists(!!document);

    return this.mapper.toResponse(document);
  }

  public async getStream(
    userId: string,
    documentId: string,
    mediaId: string,
    patientId?: string,
  ): Promise<MediaStreamResult | undefined> {
    const resolvedPatientId = await this.resolvePatientId(userId, patientId);

    const belongsToDocument =
      await this.repository.doesMediaIdBelongToSpecificPatientDocument(
        documentId,
        mediaId,
        resolvedPatientId,
      );

    if (belongsToDocument) {
      return this.mediaService.getStream(mediaId, userId);
    }
  }

  public async downloadDocument(
    userId: string,
    documentId: string,
    patientId?: string,
  ) {
    const resolvedPatientId = await this.resolvePatientId(userId, patientId);

    const mediaIds = await this.repository.findMediaIdsByDocumentIdAndPatientId(
      documentId,
      resolvedPatientId,
    );

    return this.mediaService.downloadMany(mediaIds, userId);
  }

  public async update(
    userId: string,
    dto: PatientDocumentDto,
    patientId?: string,
  ): Promise<void> {
    const resolvedPatientId = await this.resolvePatientId(userId, patientId);

    const existingMediaIds =
      await this.repository.findMediaIdsByDocumentIdAndPatientId(
        dto.id,
        resolvedPatientId,
      );

    await this.mediaService.validateOwnership(dto.mediaIds, userId);
    await this.removeOrphanedMedias(userId, existingMediaIds, dto.mediaIds);

    const updateData = this.mapper.toUpdateData(dto);
    await this.enrichWithTussData(dto.type, dto.description, updateData);

    const updated = await this.repository.updateDocumentById(
      dto.id,
      resolvedPatientId,
      updateData,
    );

    await this.validateDocumentExists(updated);
    await this.repository.replaceDocumentMedias(dto.id, dto.mediaIds);
  }

  public async rename(
    userId: string,
    documentId: string,
    newDescription: string,
    patientId?: string,
  ): Promise<void> {
    const resolvedPatientId = await this.resolvePatientId(userId, patientId);

    const updated = await this.repository.updateDescriptionByIdAndPatientId(
      documentId,
      resolvedPatientId,
      newDescription,
    );

    await this.validateDocumentExists(updated);
  }

  public async softDelete(
    userId: string,
    documentId: string,
    patientId?: string,
  ): Promise<void> {
    const resolvedPatientId = await this.resolvePatientId(userId, patientId);
    await this.repository.softDeleteById(documentId, resolvedPatientId);
  }

  private async resolvePatientId(
    userId: string,
    patientId?: string,
  ): Promise<string> {
    return patientId ?? (await this.patientService.findPatientIdByUserId(userId));
  }

  private async validateDocumentExists(exists: boolean): Promise<void> {
    acceptFalseThrows(
      exists,
      () => new NotFoundException('Documento não encontrado.'),
    );
  }

  private async removeOrphanedMedias(
    userId: string,
    existingMediaIds: string[],
    newMediaIds: string[],
  ): Promise<void> {
    const removedMediaIds = existingMediaIds.filter(
      (id) => !newMediaIds.includes(id),
    );

    await Promise.all(
      removedMediaIds.map((mediaId) =>
        this.mediaService.deleteByIdAndOwnerId(mediaId, userId),
      ),
    );
  }

  private async enrichWithTussData(
    type: PatientDocumentType,
    description: string,
    updateData: Partial<PatientDocument>,
  ): Promise<void> {
    if (type === PatientDocumentType.LABORATORY_EXAM) {
      const tuusCategory =
        await this.tuusCategoryService.findByDescription(description);

      if (tuusCategory) {
        updateData.tussCode = tuusCategory.tussCode;
        updateData.tussCategory = tuusCategory.category;
      } else {
        updateData.tussCode = null;
        updateData.tussCategory = null;
      }
    } else {
      updateData.tussCode = null;
      updateData.tussCategory = null;
    }
  }

  private async enrichEntityWithTussData(
    type: PatientDocumentType,
    description: string,
    entity: PatientDocument,
  ): Promise<void> {
    if (type === PatientDocumentType.LABORATORY_EXAM) {
      const tuusCategory =
        await this.tuusCategoryService.findByDescription(description);

      if (tuusCategory) {
        entity.tussCode = tuusCategory.tussCode;
        entity.tussCategory = tuusCategory.category;
      }
    }
  }
}
