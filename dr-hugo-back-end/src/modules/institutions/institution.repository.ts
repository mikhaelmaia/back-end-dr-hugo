import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/base/base.repository';
import { Institution } from './entities/institution.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class InstitutionRepository extends BaseRepository<Institution> {
  protected override alias = 'institution';

  public constructor(
    @InjectRepository(Institution)
    repository: Repository<Institution>,
  ) {
    super(repository);
  }

  public override findById(id: string): Promise<Institution> {
    return this.createBaseQuery()
      .where('institution.id = :id', { id })
      .leftJoinAndSelect('institution.user', 'user')
      .getOne();
  }

  public findInstitutionIdByUserId(userId: string): Promise<string | null> {
    return this.createBaseQuery()
      .innerJoin('institution.user', 'user')
      .select('institution.id', 'institutionId')
      .where('user.id = :userId', { userId })
      .getRawOne<{ institutionId: string }>()
      .then((result) => result?.institutionId ?? null);
  }
}
