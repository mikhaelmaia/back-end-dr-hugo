import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/core/base/base.service';
import { PatientMedicalRecord } from './entities/medical-record.entity';
import { PatientMedicalRecordDto } from './dtos/medical-record.dto';
import { PatientMedicalRecordRepository } from './medical-record.repository';
import { PatientMedicalRecordMapper } from './medical-record.mapper';
import { PatientsService } from '../patients/patients.service';
import { Optional } from 'src/core/utils/optional';

@Injectable()
export class PatientMedicalRecordService extends BaseService<
  PatientMedicalRecord,
  PatientMedicalRecordDto,
  PatientMedicalRecordRepository,
  PatientMedicalRecordMapper
> {
  public constructor(
    repository: PatientMedicalRecordRepository,
    mapper: PatientMedicalRecordMapper,
    private readonly patientService: PatientsService,
  ) {
    super(repository, mapper);
  }

  public async findMedicalRecordByPatientUserId(
    userId: string,
  ): Promise<PatientMedicalRecordDto | null> {
    return Optional.ofNullable(
      await this.repository.findByPatientUserId(userId),
    )
      .map((record) => this.mapper.toDto(record))
      .orElse(null);
  }

  public async updateMedicalRecordByPatientUserId(
    dto: PatientMedicalRecordDto,
    userId: string,
  ): Promise<void> {
    const found = await this.repository.findByPatientUserId(userId);

    if (found) {
      await this.updateExistingMedicalRecord(found, dto);
      return;
    }
    await this.createMedicalRecord(dto, userId);
  }

  private async createMedicalRecord(
    dto: PatientMedicalRecordDto,
    userId: string,
  ): Promise<void> {
    const entity = this.mapper.toEntity(dto);
    entity.clearId();
    entity.patient = {
      id: await this.patientService.findPatientIdByUserId(userId),
    } as any;
    await this.repository.save(entity);
  }

  private async updateExistingMedicalRecord(
    found: PatientMedicalRecord,
    dto: PatientMedicalRecordDto,
  ): Promise<void> {
    const entityToUpdate = this.mapToUpdateEntity(dto, found);

    await this.repository.save(entityToUpdate);
  }
}
