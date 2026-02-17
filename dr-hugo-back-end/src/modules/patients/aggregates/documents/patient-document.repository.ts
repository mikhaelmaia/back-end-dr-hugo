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

  public async findMonthlyDocuments(
    patientId: string,
    params: PaginationParams<PatientDocument>,
  ): Promise<{
    grouped: Record<string, PatientDocument[]>;
    totalMonths: number;
  }> {
    const limit = 2;
    const offset = (params.page - 1) * limit;

    const monthsRaw = await this.createBaseQuery()
      .select('document.examMonth', 'month')
      .where('document.patient.id = :patientId', { patientId })
      .groupBy('document.examMonth')
      .orderBy('document.examMonth', 'DESC')
      .offset(offset)
      .limit(limit)
      .getRawMany();

    const months: Date[] = monthsRaw.map((m) => m.month);

    if (!months.length) {
      return { grouped: {}, totalMonths: 0 };
    }

    const totalRaw = await this.createBaseQuery()
      .select('COUNT(DISTINCT document.examMonth)', 'count')
      .where('document.patient.id = :patientId', { patientId })
      .getRawOne();

    const totalMonths = Number(totalRaw.count);

    const docsQb = this.createBaseQuery()
      .leftJoinAndSelect('document.media', 'media')
      .where('document.patient.id = :patientId', { patientId })
      .andWhere('document.examMonth IN (:...months)', { months });

    this.applyFilters(docsQb, params.filter);
    this.applySorting(docsQb, params.sortBy, params.sortOrder);

    const documents = await docsQb.getMany();

    const grouped: Record<string, PatientDocument[]> = {};

    documents.forEach((doc) => {
      const key = doc.examMonth.toISOString().slice(0, 7);

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(doc);
    });

    return {
      grouped,
      totalMonths,
    };
  }

  protected getAllowedSortColumns(): (keyof PatientDocument)[] {
    return [...super.getAllowedSortColumns(), 'examMonth'];
  }
}
