import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientAccessCode } from './entities/patient-access-code.entity';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/core/base/base.repository';

@Injectable()
export class PatientAccessCodeRepository extends BaseRepository<PatientAccessCode> {
  protected override alias = 'accessCode';

  constructor(
    @InjectRepository(PatientAccessCode)
    repository: Repository<PatientAccessCode>,
  ) {
    super(repository);
  }

  public async findActiveByPatient(patientId: string) {
    return this.createBaseQuery()
      .innerJoin(`${this.alias}.patient`, 'patient')
      .andWhere('patient.id = :patientId', { patientId })
      .andWhere(`${this.alias}.used = false`)
      .orderBy(`${this.alias}.createdAt`, 'DESC')
      .limit(1)
      .getOne();
  }

  public findByCode(code: string) {
    return this.findOne({ where: { code } });
  }

  public async existsByCode(code: string): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder(this.alias)
      .select('1')
      .where(`${this.alias}.code = :code`, { code })
      .limit(1)
      .getRawOne();

    return !!result;
  }

  public async deleteExpiredUnused(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .from(PatientAccessCode)
      .where('expires_at < NOW()')
      .andWhere('used = false')
      .execute();
  }
}
