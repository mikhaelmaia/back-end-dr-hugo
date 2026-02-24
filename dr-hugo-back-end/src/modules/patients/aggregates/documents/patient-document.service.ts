import { Injectable } from '@nestjs/common';
import { PatientDocumentRepository } from './patient-document.repository';
import { PatientDocumentMapper } from './patient-document.mapper';
import { PatientsService } from '../../patients.service';
import { CreatePatientDocumentDto } from './dtos/create-patient-document.dto';
import { PatientDocumentDto } from './dtos/patient-document.dto';
import { PaginationParams } from 'src/core/vo/types/types';
import { PatientDocument } from './entities/patient-document.entity';

@Injectable()
export class PatientDocumentService {
  constructor(
    private readonly repository: PatientDocumentRepository,
    private readonly mapper: PatientDocumentMapper,
    private readonly patientService: PatientsService,
  ) {}

  public async create(
    userId: string,
    dto: CreatePatientDocumentDto,
  ): Promise<PatientDocumentDto> {
    const patientId = await this.patientService.findPatientIdByUserId(userId);

    const entity = this.mapper.toEntity(dto, patientId);

    const saved = await this.repository.save(entity);

    return this.mapper.toResponse(saved);
  }

  public async findMonthly(
    userId: string,
    params: PaginationParams<PatientDocument>,
  ) {
    const patientId = await this.patientService.findPatientIdByUserId(userId);

    const { grouped, totalItems, totalPages, page } =
      await this.repository.findPaginatedGroupedByMonth(patientId, params);

    const mapped: Record<string, PatientDocumentDto[]> = {};

    Object.entries(grouped).forEach(([month, docs]) => {
      mapped[month] = docs.map((doc) => this.mapper.toResponse(doc));
    });

    return {
      items: mapped,
      totalItems,
      currentPage: page,
      totalPages,
    };
  }
}
