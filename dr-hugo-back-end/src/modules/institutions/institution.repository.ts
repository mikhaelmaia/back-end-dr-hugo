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

  public findUserTaxIdByUserId(userId: string): Promise<string | null> {
    return this.createBaseQuery()
      .innerJoin('institution.user', 'user')
      .select('user.taxId', 'taxId')
      .where('user.id = :userId', { userId })
      .getRawOne<{ taxId: string }>()
      .then((result) => result?.taxId ?? null);
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

  public async updateCompanyAndAddressData(
    userId: string,
    companyData: Partial<{
      type: string;
      size: string;
      name: string;
      fantasyName: string;
      mainActivities: string[];
      secondaryActivities: string[];
      legalNature: string;
      legalRepresentativeName: string;
      legalRepresentativeQualification: string;
    }>,
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
      .update('dv_institution_company')
      .set({
        type: companyData.type,
        size: companyData.size,
        name: companyData.name,
        fantasyName: companyData.fantasyName,
        mainActivities: companyData.mainActivities,
        secondaryActivities: companyData.secondaryActivities,
        legalNature: companyData.legalNature,
        legalRepresentativeName: companyData.legalRepresentativeName,
        legalRepresentativeQualification:
          companyData.legalRepresentativeQualification,
      })
      .where(
        'institution_id = (SELECT id FROM dv_institution WHERE user_id = :userId)',
        { userId },
      )
      .execute();

    await this.repository
      .createQueryBuilder()
      .update('dv_address')
      .set({
        street: addressData.street,
        number: addressData.number,
        complement: addressData.complement,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
        country: addressData.country,
      })
      .where(
        'id = (SELECT address_id FROM dv_institution WHERE user_id = :userId)',
        { userId },
      )
      .execute();
  }
}
