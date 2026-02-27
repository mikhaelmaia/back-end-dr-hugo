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
      .leftJoinAndSelect('user.profilePicture', 'profilePicture')
      .leftJoinAndSelect('institution.address', 'address')
      .leftJoinAndSelect('institution.company', 'company')
      .leftJoinAndSelect('company.representative', 'representative')
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

  public async updateCurrentUserAddress(
    userId: string,
    addressData: Partial<{
      street: string;
      number: string;
      complement: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }>,
  ): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update('dv_address')
      .set(addressData)
      .where(
        'id = (SELECT address_id FROM dv_institution WHERE user_id = :userId)',
        { userId },
      )
      .execute();
  }
  public async existsByCnes(cnes: string): Promise<boolean> {
    const count = await this.createBaseQuery()
      .where('institution.cnes = :cnes', { cnes })
      .getCount();
    return count > 0;
  }
}
