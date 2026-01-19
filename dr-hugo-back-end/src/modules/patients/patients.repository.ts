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
      .leftJoinAndSelect(`${this.alias}.user`, 'user')
      .leftJoinAndSelect(`${this.alias}.profilePicture`, 'profilePicture')
      .where(`${this.alias}.user_id = :userId`, { userId })
      .getOne();
  }

  public async findByUserEmail(email: string): Promise<Patient | null> {
    return this.createBaseQuery()
      .leftJoinAndSelect(`${this.alias}.user`, 'user')
      .leftJoinAndSelect(`${this.alias}.profilePicture`, 'profilePicture')
      .where('user.email = :email', { email })
      .getOne();
  }

  public async findWithRelations(id: string): Promise<Patient | null> {
    return this.createBaseQuery()
      .leftJoinAndSelect(`${this.alias}.user`, 'user')
      .leftJoinAndSelect(`${this.alias}.profilePicture`, 'profilePicture')
      .where(`${this.alias}.id = :id`, { id })
      .getOne();
  }
}
