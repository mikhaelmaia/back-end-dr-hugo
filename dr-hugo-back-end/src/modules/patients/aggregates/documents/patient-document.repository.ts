import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/base/base.repository';
import { PatientDocument } from './entities/patient-document.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationParams } from 'src/core/vo/types/types';

@Injectable()
export class PatientDocumentRepository extends BaseRepository<PatientDocument> {
  protected override alias = 'document';

  constructor(
    @InjectRepository(PatientDocument)
    repository: Repository<PatientDocument>,
  ) {
    super(repository);
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

    const qb = this.createBaseQuery()
      .leftJoinAndSelect('document.media', 'media')
      .where('document.patient.id = :patientId', { patientId });

    this.applyFilters(qb, params.filter);
    this.applySorting(qb, params.sortBy, params.sortOrder);

    qb.skip(offset).take(limit);

    const [documents, totalItems] = await qb.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    const grouped: Record<string, PatientDocument[]> = {};

    for (const doc of documents) {
      const key = doc.examMonth.toISOString().slice(0, 7);

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

  protected getAllowedSortColumns(): (keyof PatientDocument)[] {
    return [...super.getAllowedSortColumns(), 'examMonth'];
  }
}
