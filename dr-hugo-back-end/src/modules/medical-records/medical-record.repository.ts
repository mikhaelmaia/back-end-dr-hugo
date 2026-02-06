import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/base/base.repository';
import { PatientMedicalRecord } from './entities/medical-record.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PatientMedicalRecordRepository extends BaseRepository<PatientMedicalRecord> {
  protected override alias = 'medicalRecord';

  public constructor(
    @InjectRepository(PatientMedicalRecord)
    repository: Repository<PatientMedicalRecord>,
  ) {
    super(repository);
  }

  public findByPatientUserId(
    userId: string,
  ): Promise<PatientMedicalRecord | null> {
    return this.createBaseQuery()
      .innerJoin('medicalRecord.patient', 'patient')
      .innerJoin('patient.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();
  }
}
