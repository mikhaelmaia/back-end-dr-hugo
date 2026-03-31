import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { BaseRepository } from 'src/core/base/base.repository';
import { PatientInstitutionGrant } from '../permission-grant/entities/patient-institution-grant.entity';
import type { PaginationParams } from 'src/core/vo/types/types';

@Injectable()
export class InstitutionGrantRepository extends BaseRepository<PatientInstitutionGrant> {
  protected override alias = 'grant';

  constructor(
    @InjectRepository(PatientInstitutionGrant)
    repository: Repository<PatientInstitutionGrant>,
  ) {
    super(repository);
  }

  public async toggleLikedByPatient(
    grantId: string,
    patientId: string,
  ): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .update(PatientInstitutionGrant)
      .set({ likedByPatient: () => 'NOT liked_by_patient' })
      .where('id = :grantId', { grantId })
      .andWhere('patient_id = :patientId', { patientId })
      .andWhere('revoked_at IS NULL')
      .execute();

    return result.affected > 0;
  }

  public async toggleLikedByInstitution(
    grantId: string,
    institutionId: string,
  ): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .update(PatientInstitutionGrant)
      .set({ likedByInstitution: () => 'NOT liked_by_institution' })
      .where('id = :grantId', { grantId })
      .andWhere('institution_id = :institutionId', { institutionId })
      .andWhere('revoked_at IS NULL')
      .execute();

    return result.affected > 0;
  }

  public async findGrantDetailsById(
    grantId: string,
    institutionId: string,
  ): Promise<{
    grantId: string;
    patientId: string;
    documentsIds: string[] | null;
    persistent: boolean;
    allowAccessToAllDocuments: boolean;
    createdAt: Date;
  } | null> {
    const grant = await this.repository.findOne({
      where: {
        id: grantId,
        institution: { id: institutionId },
        revokedAt: IsNull(),
        deletedAt: IsNull(),
      },
      relations: ['patient'],
      select: {
        id: true,
        documentsIds: true,
        persistent: true,
        allowAccessToAllDocuments: true,
        createdAt: true,
        patient: { id: true },
      },
    });

    if (!grant) return null;

    return {
      grantId: grant.id,
      patientId: grant.patient.id,
      documentsIds: grant.documentsIds ?? null,
      persistent: grant.persistent,
      allowAccessToAllDocuments: grant.allowAccessToAllDocuments,
      createdAt: grant.createdAt,
    };
  }

  public async findGrantDetailsByIdForPatient(
    grantId: string,
    patientId: string,
  ): Promise<{
    grantId: string;
    patientId: string;
    institutionId: string;
    documentsIds: string[] | null;
    persistent: boolean;
    allowAccessToAllDocuments: boolean;
    createdAt: Date;
  } | null> {
    const grant = await this.repository.findOne({
      where: {
        id: grantId,
        patient: { id: patientId },
        revokedAt: IsNull(),
        deletedAt: IsNull(),
      },
      relations: ['patient', 'institution'],
      select: {
        id: true,
        documentsIds: true,
        persistent: true,
        allowAccessToAllDocuments: true,
        createdAt: true,
        patient: { id: true },
        institution: { id: true },
      },
    });

    if (!grant) return null;

    return {
      grantId: grant.id,
      patientId: grant.patient.id,
      institutionId: grant.institution.id,
      documentsIds: grant.documentsIds ?? null,
      persistent: grant.persistent,
      allowAccessToAllDocuments: grant.allowAccessToAllDocuments,
      createdAt: grant.createdAt,
    };
  }

  public async appendDocumentToGrant(
    grantId: string,
    institutionId: string,
    documentId: string,
  ): Promise<void> {
    await this.repository.query(
      `UPDATE dv_patient_institution_grant
       SET documents_ids = array_append(COALESCE(documents_ids, ARRAY[]::text[]), $1)
       WHERE id = $2 AND institution_id = $3`,
      [documentId, grantId, institutionId],
    );
  }

  // ── Patient-facing: see which institutions have access ─────────────────────

  public async findGrantedInstitutionsPaginated(
    patientId: string,
    params: PaginationParams<PatientInstitutionGrant>,
  ): Promise<{ items: PatientInstitutionGrant[]; totalItems: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const filter = params.filter as any;
    const sortOrder = params.sortOrder ?? 'DESC';
    const sortBy = params.sortBy as string;

    const qb = this.createBaseQuery()
      .innerJoin('grant.patient', 'patient')
      .innerJoinAndSelect('grant.institution', 'institution')
      .innerJoinAndSelect('institution.user', 'user')
      .andWhere('patient.id = :patientId', { patientId })
      .andWhere('grant.revokedAt IS NULL');

    if (filter?.name?.ilike) {
      qb.andWhere('user.name ILIKE :name', { name: filter.name.ilike });
    }

    if (filter?.medicalInstitutionType) {
      qb.andWhere(
        'institution.medicalInstitutionType = :medicalInstitutionType',
        {
          medicalInstitutionType: filter.medicalInstitutionType,
        },
      );
    }

    if (filter?.otherMedicalInstitutionType?.ilike) {
      qb.andWhere('institution.otherMedicalInstitutionType ILIKE :otherType', {
        otherType: filter.otherMedicalInstitutionType.ilike,
      });
    }

    if (filter?.liked === true || filter?.liked === 'true') {
      qb.andWhere('grant.likedByPatient = true');
    } else if (filter?.liked === false || filter?.liked === 'false') {
      qb.andWhere('grant.likedByPatient = false');
    }

    if (sortBy === 'name') {
      qb.orderBy('user.name', sortOrder);
    } else {
      qb.orderBy('grant.createdAt', 'DESC');
    }

    qb.take(limit).skip((page - 1) * limit);

    const [items, totalItems] = await qb.getManyAndCount();
    return { items, totalItems };
  }

  public async findGrantedInstitutionByGrantId(
    grantId: string,
    patientId: string,
  ): Promise<PatientInstitutionGrant | null> {
    return this.repository.findOne({
      where: {
        id: grantId,
        patient: { id: patientId },
        revokedAt: IsNull(),
        deletedAt: IsNull(),
      },
      relations: ['institution', 'institution.user'],
    });
  }

  public async findInstitutionProfilePictureIdByGrantId(
    grantId: string,
    patientId: string,
  ): Promise<string | null | undefined> {
    const result = await this.createBaseQuery()
      .innerJoin('grant.patient', 'patient')
      .innerJoin('grant.institution', 'institution')
      .innerJoin('institution.user', 'user')
      .leftJoin('user.profilePicture', 'profilePicture')
      .select('grant.id', 'grantId')
      .addSelect('profilePicture.id', 'profilePictureId')
      .andWhere('grant.id = :grantId', { grantId })
      .andWhere('patient.id = :patientId', { patientId })
      .andWhere('grant.revokedAt IS NULL')
      .getRawOne<{ grantId: string; profilePictureId: string | null }>();

    if (!result) return undefined;
    return result.profilePictureId ?? null;
  }
}
