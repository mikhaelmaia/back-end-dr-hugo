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

  public async findByUserId(userId: string): Promise<Patient | null> {
    return this.createBaseQuery()
      .where(`${this.alias}.user_id = :userId`, { userId })
      .getOne();
  }
}
