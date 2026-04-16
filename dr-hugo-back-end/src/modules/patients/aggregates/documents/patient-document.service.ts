import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PatientDocumentRepository } from './patient-document.repository';
import { PatientDocumentMapper } from './patient-document.mapper';
import { PatientsService } from '../../patients.service';
import { CreatePatientDocumentDto } from './dtos/create-patient-document.dto';
import { PatientDocumentDto } from './dtos/patient-document.dto';
import { MediaStreamResult, PaginationParams } from 'src/core/vo/types/types';
import { PatientDocument } from './entities/patient-document.entity';
import { MediaService } from 'src/core/modules/media/media.service';
import { MinioBuckets } from 'src/core/modules/media/minio/minio.buckets';
import { PatientDocumentListItemDto } from './dtos/patient-document-list-item.dto';
import { PatientDocumentAvailableFiltersDto } from './dtos/patient-document-available-filters.dto';
import { acceptFalseThrows } from 'src/core/utils/functions';
import { TuusCategoryService } from 'src/core/modules/domain/tuus-category/tuus-category.service';
import { PatientDocumentType } from 'src/core/vo/consts/enums';
import { PatientDocumentPaginatedDto } from './dtos/patient-document-paginated.dto';
import { formatMonthYearToBrazilian } from 'src/core/utils/date-time.utils';
import { DataSource } from 'typeorm';

@Injectable()
export class PatientDocumentService {
  constructor(
    private readonly repository: PatientDocumentRepository,
    private readonly mapper: PatientDocumentMapper,
    private readonly patientService: PatientsService,
    private readonly mediaService: MediaService,
    private readonly tuusCategoryService: TuusCategoryService,
    private readonly dataSource: DataSource,
  ) {}

  public async create(
    userId: string,
    dto: CreatePatientDocumentDto,
    patientId?: string,
  ): Promise<PatientDocumentDto> {
    const resolvedPatientId = await this.resolvePatientId(userId, patientId);

    await this.mediaService.validateOwnership(dto.mediaIds, userId);

    const entity = this.mapper.toEntity(dto, resolvedPatientId);

    const tussData = await this.resolveTussData(dto.type, dto.description);
    entity.tussCode = tussData.tussCode;
    entity.tussCategory = tussData.tussCategory;

    const saved = await this.repository.save(entity);

    await Promise.all(
      dto.mediaIds.map((mediaId) =>
        this.mediaService.persistMedia(
          mediaId,
          userId,
          MinioBuckets.PATIENT_DOCUMENTS,
        ),
      ),
    );

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
    documentsIds?: string[],
  ): Promise<PatientDocumentAvailableFiltersDto> {
    const resolvedPatientId = await this.resolvePatientId(userId, patientId);
    return this.repository.findAvailableFilters(
      resolvedPatientId,
      documentsIds,
    );
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
  ): Promise<MediaStreamResult> {
    const resolvedPatientId = await this.resolvePatientId(userId, patientId);

    const belongsToDocument =
      await this.repository.doesMediaIdBelongToSpecificPatientDocument(
        documentId,
        mediaId,
        resolvedPatientId,
      );

    if (!belongsToDocument) {
      throw new ForbiddenException(
        'Arquivo não pertence ao documento informado.',
      );
    }

    return this.mediaService.getStream(mediaId, userId);
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

    await this.validateDocumentExists(mediaIds.length > 0);

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

    await this.validateDocumentExists(existingMediaIds.length > 0);

    await this.mediaService.validateOwnership(dto.mediaIds, userId);

    await this.dataSource.transaction(async (manager) => {
      const removedMediaIds = existingMediaIds.filter(
        (id) => !dto.mediaIds.includes(id),
      );

      await Promise.all(
        removedMediaIds.map((mediaId) =>
          this.mediaService.deleteByIdAndOwnerId(mediaId, userId),
        ),
      );

      const updateData = this.mapper.toUpdateData(dto);

      const tussData = await this.resolveTussData(dto.type, dto.description);

      updateData.tussCode = tussData.tussCode;
      updateData.tussCategory = tussData.tussCategory;

      const result = await manager.update(
        PatientDocument,
        { id: dto.id, patient: { id: resolvedPatientId } },
        updateData,
      );

      if (result.affected === 0) {
        throw new NotFoundException('Documento não encontrado.');
      }

      await this.repository.replaceDocumentMedias(dto.id, dto.mediaIds);

      const newMediaIds = dto.mediaIds.filter(
        (id) => !existingMediaIds.includes(id),
      );

      await Promise.all(
        newMediaIds.map((mediaId) =>
          this.mediaService.persistMedia(
            mediaId,
            userId,
            MinioBuckets.PATIENT_DOCUMENTS,
          ),
        ),
      );
    });
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

    const exists = await this.repository.updateDocumentById(
      documentId,
      resolvedPatientId,
      { deletedAt: new Date() },
    );

    await this.validateDocumentExists(exists);
  }

  private async resolvePatientId(
    userId: string,
    patientId?: string,
  ): Promise<string> {
    return (
      patientId ?? (await this.patientService.findPatientIdByUserId(userId))
    );
  }

  private async resolveTussData(
    type: PatientDocumentType,
    description: string,
  ): Promise<{ tussCode: string | null; tussCategory: string | null }> {
    if (type !== PatientDocumentType.LABORATORY_EXAM) {
      return { tussCode: null, tussCategory: null };
    }

    const tuusCategory =
      await this.tuusCategoryService.findByDescription(description);

    if (!tuusCategory) {
      return { tussCode: null, tussCategory: null };
    }

    return {
      tussCode: tuusCategory.tussCode,
      tussCategory: tuusCategory.category,
    };
  }

  public async documentExistsByIdAndPatientId(
    documentId: string,
    patientId: string,
  ): Promise<boolean> {
    return this.repository.existsByIdAndPatientId(documentId, patientId);
  }

  public async findIdsByCreatedAfter(
    patientId: string,
    date: Date,
  ): Promise<string[]> {
    return this.repository.findIdsByPatientIdCreatedAfter(patientId, date);
  }

  public async findAllIdsByPatientId(patientId: string): Promise<string[]> {
    return this.repository.findAllIdsByPatientId(patientId);
  }

  private async validateDocumentExists(exists: boolean): Promise<void> {
    acceptFalseThrows(
      exists,
      () => new NotFoundException('Documento não encontrado.'),
    );
  }
}
