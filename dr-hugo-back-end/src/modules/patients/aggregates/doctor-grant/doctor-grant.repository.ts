import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { BaseRepository } from 'src/core/base/base.repository';
import { PatientDoctorGrant } from '../permission-grant/entities/patient-doctor-grant.entity';
import type { PaginationParams } from 'src/core/vo/types/types';

@Injectable()
export class DoctorGrantRepository extends BaseRepository<PatientDoctorGrant> {
  protected override alias = 'grant';

  constructor(
    @InjectRepository(PatientDoctorGrant)
    repository: Repository<PatientDoctorGrant>,
  ) {
    super(repository);
  }

  public async toggleLikedByPatient(
    grantId: string,
    patientId: string,
  ): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .update(PatientDoctorGrant)
      .set({ likedByPatient: () => 'NOT liked_by_patient' })
      .where('id = :grantId', { grantId })
      .andWhere('patient_id = :patientId', { patientId })
      .andWhere('revoked_at IS NULL')
      .execute();

    return result.affected > 0;
  }

  public async toggleLikedByDoctor(
    grantId: string,
    doctorId: string,
  ): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .update(PatientDoctorGrant)
      .set({ likedByDoctor: () => 'NOT liked_by_doctor' })
      .where('id = :grantId', { grantId })
      .andWhere('doctor_id = :doctorId', { doctorId })
      .andWhere('revoked_at IS NULL')
      .execute();

    return result.affected > 0;
  }

  public async findGrantDetailsById(
    grantId: string,
    doctorId: string,
  ): Promise<{
    patientId: string;
    documentsIds: string[] | null;
    persistent: boolean;
    allowAccessToAllDocuments: boolean;
    createdAt: Date;
  } | null> {
    const grant = await this.repository.findOne({
      where: {
        id: grantId,
        doctor: { id: doctorId },
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
    patientId: string;
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
      patientId: grant.patient.id,
      documentsIds: grant.documentsIds ?? null,
      persistent: grant.persistent,
      allowAccessToAllDocuments: grant.allowAccessToAllDocuments,
      createdAt: grant.createdAt,
    };
  }

  // ── Patient-facing: see which doctors have access ─────────────────────────

  public async findGrantedDoctorsPaginated(
    patientId: string,
    params: PaginationParams<PatientDoctorGrant>,
  ): Promise<{ items: PatientDoctorGrant[]; totalItems: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const filter = params.filter as any;
    const sortOrder = params.sortOrder ?? 'DESC';
    const sortBy = params.sortBy as string;

    const qb = this.createBaseQuery()
      .innerJoin('grant.patient', 'patient')
      .innerJoinAndSelect('grant.doctor', 'doctor')
      .innerJoinAndSelect('doctor.user', 'user')
      .leftJoinAndSelect('doctor.specializations', 'specialization')
      .andWhere('patient.id = :patientId', { patientId })
      .andWhere('grant.revokedAt IS NULL');

    if (filter?.name?.ilike) {
      qb.andWhere('user.name ILIKE :name', { name: filter.name.ilike });
    }

    if (filter?.specialty) {
      qb.andWhere(
        'specialization.name = :specialty AND specialization.isActive = true',
        { specialty: filter.specialty },
      );
    }

    if (filter?.gender) {
      qb.andWhere('doctor.gender = :gender', { gender: filter.gender });
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

  public async findGrantedDoctorByGrantId(
    grantId: string,
    patientId: string,
  ): Promise<PatientDoctorGrant | null> {
    return this.repository.findOne({
      where: {
        id: grantId,
        patient: { id: patientId },
        revokedAt: IsNull(),
        deletedAt: IsNull(),
      },
      relations: ['doctor', 'doctor.user', 'doctor.specializations'],
    });
  }

  public async findDoctorProfilePictureIdByGrantId(
    grantId: string,
    patientId: string,
  ): Promise<string | null | undefined> {
    const result = await this.createBaseQuery()
      .innerJoin('grant.patient', 'patient')
      .innerJoin('grant.doctor', 'doctor')
      .innerJoin('doctor.user', 'user')
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
