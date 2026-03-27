import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/base/base.repository';
import { PatientDocument } from './entities/patient-document.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationParams } from 'src/core/vo/types/types';
import { PatientDocumentAvailableFiltersDto } from './dtos/patient-document-available-filters.dto';
import { PatientDocumentMedia } from './entities/patient-document-media.entity';

@Injectable()
export class PatientDocumentRepository extends BaseRepository<PatientDocument> {
  protected override alias = 'document';

  constructor(
    @InjectRepository(PatientDocument)
    repository: Repository<PatientDocument>,
  ) {
    super(repository);
  }

  public async updateDescriptionByIdAndPatientId(
    id: string,
    patientId: string,
    description: string,
  ): Promise<boolean> {
    const result = await this.repository.update(
      { id, patient: { id: patientId } },
      { description },
    );
    return result.affected > 0;
  }

  public async findMediaIdsByDocumentIdAndPatientId(
    documentId: string,
    patientId: string,
  ): Promise<string[]> {
    const rows = await this.createBaseQuery()
      .innerJoin('document.medias', 'documentMedia')
      .innerJoin('documentMedia.media', 'media')
      .select('media.id', 'id')
      .where('document.id = :documentId', { documentId })
      .andWhere('document.patient.id = :patientId', { patientId })
      .getRawMany();

    return rows.map((r) => r.id);
  }

  public async findPaginatedGroupedByMonth(
    patientId: string,
    params: PaginationParams<PatientDocument>,
  ): Promise<{
    grouped: Record<string, PatientDocument[]>;
    totalItems: number;
    totalPages: number;
    page: number;
  }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const offset = (page - 1) * limit;

    const qb = this.createBaseQuery().where(
      'document.patient.id = :patientId',
      { patientId },
    );

    this.applyFilters(qb, params.filter);
    this.applySorting(qb, params.sortBy, params.sortOrder);

    qb.skip(offset).take(limit);

    const [documents, totalItems] = await qb.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    const grouped: Record<string, PatientDocument[]> = {};

    for (const doc of documents) {
      const key = doc.examMonth;

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(doc);
    }

    return {
      grouped,
      totalItems,
      totalPages,
      page,
    };
  }

  public async findAvailableFilters(
    patientId: string,
    documentsIds?: string[],
  ): Promise<PatientDocumentAvailableFiltersDto> {
    let query = this.createBaseQuery()
      .select([
        `ARRAY_REMOVE(ARRAY_AGG(DISTINCT "document"."type"), NULL) AS "documentTypes"`,
        `ARRAY_REMOVE(ARRAY_AGG(DISTINCT "document"."description"), NULL) AS "descriptions"`,
        `ARRAY_REMOVE(ARRAY_AGG(DISTINCT "document"."requester_name"), NULL) AS "doctors"`,
        `ARRAY_REMOVE(ARRAY_AGG(DISTINCT "document"."exam_location"), NULL) AS "locations"`,
        `ARRAY_REMOVE(ARRAY_AGG(DISTINCT "document"."exam_date"::date), NULL) AS "examDates"`,
      ])
      .where('document.patient.id = :patientId', { patientId })
      .andWhere('document.deleted_at IS NULL');

    if (documentsIds?.length) {
      query = query.andWhere('document.id = ANY(:documentsIds)', {
        documentsIds,
      });
    }

    const result = await query.getRawOne<PatientDocumentAvailableFiltersDto>();

    return {
      documentTypes: result?.documentTypes ?? [],
      descriptions: result?.descriptions ?? [],
      doctors: result?.doctors ?? [],
      locations: result?.locations ?? [],
      examDates:
        result?.examDates?.map((date: Date | string) =>
          typeof date === 'string' ? date : date.toISOString().split('T')[0],
        ) ?? [],
    };
  }

  public async findByIdAndPatientId(
    id: string,
    patientId: string,
  ): Promise<PatientDocument | null> {
    return this.createBaseQuery()
      .leftJoinAndSelect('document.medias', 'documentMedia')
      .leftJoinAndSelect('documentMedia.media', 'media')
      .where('document.id = :id', { id })
      .andWhere('document.patient.id = :patientId', { patientId })
      .orderBy('documentMedia.order', 'ASC')
      .getOne();
  }

  public async doesMediaIdBelongToPatientDocument(
    mediaId: string,
    patientId: string,
  ): Promise<boolean> {
    const result = await this.createBaseQuery()
      .innerJoin('document.medias', 'documentMedia')
      .innerJoin('documentMedia.media', 'media')
      .innerJoin('document.patient', 'patient')
      .where('media.id = :mediaId', { mediaId })
      .andWhere('patient.id = :patientId', { patientId })
      .getExists();

    return result;
  }

  public async doesMediaIdBelongToSpecificPatientDocument(
    documentId: string,
    mediaId: string,
    patientId: string,
  ): Promise<boolean> {
    const result = await this.createBaseQuery()
      .innerJoin('document.medias', 'documentMedia')
      .innerJoin('documentMedia.media', 'media')
      .where('document.id = :documentId', { documentId })
      .andWhere('media.id = :mediaId', { mediaId })
      .andWhere('document.patient.id = :patientId', { patientId })
      .getExists();

    return result;
  }

  public async updateDocumentById(
    id: string,
    patientId: string,
    updateData: Partial<PatientDocument>,
  ): Promise<boolean> {
    const result = await this.repository.update(
      { id, patient: { id: patientId } },
      updateData,
    );
    return result.affected > 0;
  }

  public async replaceDocumentMedias(
    documentId: string,
    mediaIds: string[],
  ): Promise<void> {
    const entityManager = this.repository.manager;

    // Remove todas as mídias antigas do documento
    await entityManager.delete(PatientDocumentMedia, {
      patientDocument: { id: documentId },
    });

    // Insere as novas mídias
    const newMedias = mediaIds.map((mediaId, index) => {
      const documentMedia = new PatientDocumentMedia();
      documentMedia.patientDocument = { id: documentId } as any;
      documentMedia.media = { id: mediaId } as any;
      documentMedia.order = index;
      documentMedia.isPrimary = index === 0;
      return documentMedia;
    });

    if (newMedias.length > 0) {
      await entityManager.save(PatientDocumentMedia, newMedias);
    }
  }

  public async softDeleteById(id: string, patientId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(PatientDocument)
      .set({ deletedAt: () => 'CURRENT_TIMESTAMP' })
      .where('id = :id', { id })
      .andWhere('patient.id = :patientId', { patientId })
      .execute();
  }

  protected getAllowedSortColumns(): (keyof PatientDocument)[] {
    return [
      ...super.getAllowedSortColumns(),
      'examMonth',
      'examDate',
      'type',
      'description',
      'requesterName',
      'examLocation',
    ];
  }
}
