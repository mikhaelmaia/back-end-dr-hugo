import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/base/base.repository';
import { Patient } from './entities/patient.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PatientsRepository extends BaseRepository<Patient> {
  protected override alias = 'patient';

  public constructor(
    @InjectRepository(Patient)
    patientRepository: Repository<Patient>,
  ) {
    super(patientRepository);
  }

  public findPatientIdByUserId(userId: string): Promise<string | null> {
    return this.createBaseQuery()
      .innerJoin('patient.user', 'user')
      .select('patient.id', 'patientId')
      .where('user.id = :userId', { userId })
      .getRawOne<{ patientId: string }>()
      .then((result) => result?.patientId ?? null);
  }
}
