import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoService } from 'src/core/modules/crypto/crypto.service';
import {
  InsertResult,
  IsNull,
  Not,
  QueryDeepPartialEntity,
  Repository,
} from 'typeorm';
import type { PaginationParams } from 'src/core/vo/types/types';
import { GrantedPatientDetailDto } from './dtos/granted-patient-detail.dto';
import { GrantedPatientListItemDto } from './dtos/granted-patient-list-item.dto';
import { PatientDoctorGrant } from './entities/patient-doctor-grant.entity';
import { PatientInstitutionGrant } from './entities/patient-institution-grant.entity';

@Injectable()
export class PatientPermissionGrantRepository {
  constructor(
    @InjectRepository(PatientDoctorGrant)
    private readonly doctorGrantRepo: Repository<PatientDoctorGrant>,
    @InjectRepository(PatientInstitutionGrant)
    private readonly institutionGrantRepo: Repository<PatientInstitutionGrant>,
    private readonly cryptoService: CryptoService,
  ) {}

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private mapGrantToPatientListItem(
    grant: PatientDoctorGrant | PatientInstitutionGrant,
    liked: boolean,
  ): GrantedPatientListItemDto {
    const patient = grant.patient;
    const user = patient.user;
    return {
      grantId: grant.id,
      patientId: patient.id,
      name: user.name,
      liked,
      gender: patient.gender,
      birthDate: patient.birthDate,
      age: this.calculateAge(new Date(patient.birthDate)),
      email: user.email ? this.cryptoService.decrypt(user.email) : user.email,
      countryCode: user.countryCode,
      countryIdd: user.countryIdd,
      phone: user.phone ? this.cryptoService.decrypt(user.phone) : user.phone,
    };
  }

  public existsActiveDoctorGrant(
    patientId: string,
    doctorId: string,
  ): Promise<boolean> {
    return this.doctorGrantRepo.exists({
      where: {
        patient: { id: patientId },
        doctor: { id: doctorId },
        revokedAt: IsNull(),
      },
    });
  }

  public existsActiveInstitutionGrant(
    patientId: string,
    institutionId: string,
  ): Promise<boolean> {
    return this.institutionGrantRepo.exists({
      where: {
        patient: { id: patientId },
        institution: { id: institutionId },
        revokedAt: IsNull(),
      },
    });
  }

  public insertDoctorGrant(
    data: QueryDeepPartialEntity<PatientDoctorGrant>,
  ): Promise<InsertResult> {
    return this.doctorGrantRepo.insert(data);
  }

  public insertInstitutionGrant(
    data: QueryDeepPartialEntity<PatientInstitutionGrant>,
  ): Promise<InsertResult> {
    return this.institutionGrantRepo.insert(data);
  }

  public existsDoctorGrantByIdAndPatientId(
    grantId: string,
    patientId: string,
  ): Promise<boolean> {
    return this.doctorGrantRepo.exists({
      where: { id: grantId, patient: { id: patientId } },
    });
  }

  public existsRevokedDoctorGrantByIdAndPatientId(
    grantId: string,
    patientId: string,
  ): Promise<boolean> {
    return this.doctorGrantRepo.exists({
      where: {
        id: grantId,
        patient: { id: patientId },
        revokedAt: Not(IsNull()),
      },
    });
  }

  public async revokeDoctorGrant(
    grantId: string,
    patientId: string,
  ): Promise<void> {
    await this.doctorGrantRepo
      .createQueryBuilder()
      .update(PatientDoctorGrant)
      .set({ revokedAt: () => 'CURRENT_TIMESTAMP' })
      .where('id = :grantId', { grantId })
      .andWhere('patient_id = :patientId', { patientId })
      .execute();
  }

  public existsInstitutionGrantByIdAndPatientId(
    grantId: string,
    patientId: string,
  ): Promise<boolean> {
    return this.institutionGrantRepo.exists({
      where: { id: grantId, patient: { id: patientId } },
    });
  }

  public existsRevokedInstitutionGrantByIdAndPatientId(
    grantId: string,
    patientId: string,
  ): Promise<boolean> {
    return this.institutionGrantRepo.exists({
      where: {
        id: grantId,
        patient: { id: patientId },
        revokedAt: Not(IsNull()),
      },
    });
  }

  public async revokeInstitutionGrant(
    grantId: string,
    patientId: string,
  ): Promise<void> {
    await this.institutionGrantRepo
      .createQueryBuilder()
      .update(PatientInstitutionGrant)
      .set({ revokedAt: () => 'CURRENT_TIMESTAMP' })
      .where('id = :grantId', { grantId })
      .andWhere('patient_id = :patientId', { patientId })
      .execute();
  }

  public async findDoctorGrantByIdAndDoctorId(
    grantId: string,
    doctorId: string,
  ): Promise<{ patientId: string; revokedAt: Date | null } | null> {
    const grant = await this.doctorGrantRepo.findOne({
      where: {
        id: grantId,
        doctor: { id: doctorId },
        deletedAt: IsNull(),
      },
      select: ['id', 'revokedAt'],
      relations: ['patient'],
    });

    if (!grant) return null;

    return {
      patientId: grant.patient.id,
      revokedAt: grant.revokedAt,
    };
  }

  public async findInstitutionGrantByIdAndInstitutionId(
    grantId: string,
    institutionId: string,
  ): Promise<{ patientId: string; revokedAt: Date | null } | null> {
    const grant = await this.institutionGrantRepo.findOne({
      where: {
        id: grantId,
        institution: { id: institutionId },
        deletedAt: IsNull(),
      },
      select: ['id', 'revokedAt'],
      relations: ['patient'],
    });

    if (!grant) return null;

    return {
      patientId: grant.patient.id,
      revokedAt: grant.revokedAt,
    };
  }

  public async findGrantedPatientsForDoctor(
    doctorId: string,
    params: PaginationParams<any>,
  ): Promise<{ items: GrantedPatientListItemDto[]; totalItems: number }> {
    const { page = 1, limit = 10, sortBy, sortOrder, filter } = params ?? {};

    const qb = this.doctorGrantRepo
      .createQueryBuilder('grant')
      .innerJoin('grant.doctor', 'doctor')
      .innerJoinAndSelect('grant.patient', 'patient')
      .innerJoinAndSelect('patient.user', 'user')
      .andWhere('doctor.id = :doctorId', { doctorId })
      .andWhere('grant.revokedAt IS NULL')
      .andWhere('grant.deletedAt IS NULL');

    if (filter?.name?.ilike) {
      qb.andWhere('user.name ILIKE :name', { name: filter.name.ilike });
    }
    if (filter?.gender) {
      qb.andWhere('patient.gender = :gender', { gender: filter.gender });
    }
    if (filter?.minAge != null) {
      qb.andWhere(`EXTRACT(YEAR FROM age(patient.birth_date)) >= :minAge`, {
        minAge: Number(filter.minAge),
      });
    }
    if (filter?.maxAge != null) {
      qb.andWhere(`EXTRACT(YEAR FROM age(patient.birth_date)) <= :maxAge`, {
        maxAge: Number(filter.maxAge),
      });
    }
    if (filter?.liked === true || filter?.liked === 'true') {
      qb.andWhere('grant.likedByDoctor = true');
    } else if (filter?.liked === false || filter?.liked === 'false') {
      qb.andWhere('grant.likedByDoctor = false');
    }

    if (sortBy === 'name') {
      qb.orderBy('user.name', (sortOrder as 'ASC' | 'DESC') ?? 'ASC');
    } else {
      qb.orderBy('grant.createdAt', 'DESC');
    }

    const totalItems = await qb.getCount();
    const rows = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const items = rows.map((g) =>
      this.mapGrantToPatientListItem(g, g.likedByDoctor),
    );

    return { items, totalItems };
  }

  public async findGrantedPatientByGrantIdForDoctor(
    grantId: string,
    doctorId: string,
  ): Promise<GrantedPatientDetailDto | null> {
    const grant = await this.doctorGrantRepo
      .createQueryBuilder('grant')
      .innerJoin('grant.doctor', 'doctor')
      .innerJoinAndSelect('grant.patient', 'patient')
      .innerJoinAndSelect('patient.user', 'user')
      .andWhere('grant.id = :grantId', { grantId })
      .andWhere('doctor.id = :doctorId', { doctorId })
      .andWhere('grant.revokedAt IS NULL')
      .andWhere('grant.deletedAt IS NULL')
      .getOne();

    if (!grant) return null;

    return this.mapGrantToPatientListItem(grant, grant.likedByDoctor);
  }

  public async findGrantedPatientsForInstitution(
    institutionId: string,
    params: PaginationParams<any>,
  ): Promise<{ items: GrantedPatientListItemDto[]; totalItems: number }> {
    const { page = 1, limit = 10, sortBy, sortOrder, filter } = params ?? {};

    const qb = this.institutionGrantRepo
      .createQueryBuilder('grant')
      .innerJoin('grant.institution', 'institution')
      .innerJoinAndSelect('grant.patient', 'patient')
      .innerJoinAndSelect('patient.user', 'user')
      .andWhere('institution.id = :institutionId', { institutionId })
      .andWhere('grant.revokedAt IS NULL')
      .andWhere('grant.deletedAt IS NULL');

    if (filter?.name?.ilike) {
      qb.andWhere('user.name ILIKE :name', { name: filter.name.ilike });
    }
    if (filter?.gender) {
      qb.andWhere('patient.gender = :gender', { gender: filter.gender });
    }
    if (filter?.minAge != null) {
      qb.andWhere(`EXTRACT(YEAR FROM age(patient.birth_date)) >= :minAge`, {
        minAge: Number(filter.minAge),
      });
    }
    if (filter?.maxAge != null) {
      qb.andWhere(`EXTRACT(YEAR FROM age(patient.birth_date)) <= :maxAge`, {
        maxAge: Number(filter.maxAge),
      });
    }
    if (filter?.liked === true || filter?.liked === 'true') {
      qb.andWhere('grant.likedByInstitution = true');
    } else if (filter?.liked === false || filter?.liked === 'false') {
      qb.andWhere('grant.likedByInstitution = false');
    }

    if (sortBy === 'name') {
      qb.orderBy('user.name', (sortOrder as 'ASC' | 'DESC') ?? 'ASC');
    } else {
      qb.orderBy('grant.createdAt', 'DESC');
    }

    const totalItems = await qb.getCount();
    const rows = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const items = rows.map((g) =>
      this.mapGrantToPatientListItem(g, g.likedByInstitution),
    );

    return { items, totalItems };
  }

  public async findGrantedPatientByGrantIdForInstitution(
    grantId: string,
    institutionId: string,
  ): Promise<GrantedPatientDetailDto | null> {
    const grant = await this.institutionGrantRepo
      .createQueryBuilder('grant')
      .innerJoin('grant.institution', 'institution')
      .innerJoinAndSelect('grant.patient', 'patient')
      .innerJoinAndSelect('patient.user', 'user')
      .andWhere('grant.id = :grantId', { grantId })
      .andWhere('institution.id = :institutionId', { institutionId })
      .andWhere('grant.revokedAt IS NULL')
      .andWhere('grant.deletedAt IS NULL')
      .getOne();

    if (!grant) return null;

    return this.mapGrantToPatientListItem(grant, grant.likedByInstitution);
  }

  // ── Profile picture lookup ─────────────────────────────────────────────────

  public async findPatientProfilePictureIdByGrantIdForDoctor(
    grantId: string,
    doctorId: string,
  ): Promise<string | null | undefined> {
    const result = await this.doctorGrantRepo
      .createQueryBuilder('grant')
      .innerJoin('grant.doctor', 'doctor')
      .innerJoin('grant.patient', 'patient')
      .innerJoin('patient.user', 'user')
      .leftJoin('user.profilePicture', 'profilePicture')
      .select('grant.id', 'grantId')
      .addSelect('profilePicture.id', 'profilePictureId')
      .andWhere('grant.id = :grantId', { grantId })
      .andWhere('doctor.id = :doctorId', { doctorId })
      .andWhere('grant.revokedAt IS NULL')
      .andWhere('grant.deletedAt IS NULL')
      .getRawOne<{ grantId: string; profilePictureId: string | null }>();

    if (!result) return undefined;
    return result.profilePictureId ?? null;
  }

  public async findPatientProfilePictureIdByGrantIdForInstitution(
    grantId: string,
    institutionId: string,
  ): Promise<string | null | undefined> {
    const result = await this.institutionGrantRepo
      .createQueryBuilder('grant')
      .innerJoin('grant.institution', 'institution')
      .innerJoin('grant.patient', 'patient')
      .innerJoin('patient.user', 'user')
      .leftJoin('user.profilePicture', 'profilePicture')
      .select('grant.id', 'grantId')
      .addSelect('profilePicture.id', 'profilePictureId')
      .andWhere('grant.id = :grantId', { grantId })
      .andWhere('institution.id = :institutionId', { institutionId })
      .andWhere('grant.revokedAt IS NULL')
      .andWhere('grant.deletedAt IS NULL')
      .getRawOne<{ grantId: string; profilePictureId: string | null }>();

    if (!result) return undefined;
    return result.profilePictureId ?? null;
  }

  // ── Like/Unlike management ─────────────────────────────────────────────────

  public async toggleLikedByPatient(
    grantId: string,
    patientId: string,
  ): Promise<boolean> {
    // Doctor grant toggle
    const doctorResult = await this.doctorGrantRepo
      .createQueryBuilder()
      .update(PatientDoctorGrant)
      .set({ likedByPatient: () => 'NOT liked_by_patient' })
      .where('id = :grantId', { grantId })
      .andWhere('patient_id = :patientId', { patientId })
      .andWhere('revoked_at IS NULL')
      .execute();

    if (doctorResult.affected > 0) return true;

    // Institution grant toggle
    const institutionResult = await this.institutionGrantRepo
      .createQueryBuilder()
      .update(PatientInstitutionGrant)
      .set({ likedByPatient: () => 'NOT liked_by_patient' })
      .where('id = :grantId', { grantId })
      .andWhere('patient_id = :patientId', { patientId })
      .andWhere('revoked_at IS NULL')
      .execute();

    return institutionResult.affected > 0;
  }

  public async toggleLikedByDoctor(
    grantId: string,
    doctorId: string,
  ): Promise<boolean> {
    const result = await this.doctorGrantRepo
      .createQueryBuilder()
      .update(PatientDoctorGrant)
      .set({ likedByDoctor: () => 'NOT liked_by_doctor' })
      .where('id = :grantId', { grantId })
      .andWhere('doctor_id = :doctorId', { doctorId })
      .andWhere('revoked_at IS NULL')
      .execute();

    return result.affected > 0;
  }

  public async toggleLikedByInstitution(
    grantId: string,
    institutionId: string,
  ): Promise<boolean> {
    const result = await this.institutionGrantRepo
      .createQueryBuilder()
      .update(PatientInstitutionGrant)
      .set({ likedByInstitution: () => 'NOT liked_by_institution' })
      .where('id = :grantId', { grantId })
      .andWhere('institution_id = :institutionId', { institutionId })
      .andWhere('revoked_at IS NULL')
      .execute();

    return result.affected > 0;
  }
}
