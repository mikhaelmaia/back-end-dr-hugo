import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientDocument } from '../patients/aggregates/documents/entities/patient-document.entity';
import { PatientDoctorGrant } from '../patients/aggregates/permission-grant/entities/patient-doctor-grant.entity';
import { PatientInstitutionGrant } from '../patients/aggregates/permission-grant/entities/patient-institution-grant.entity';
import { NewPatientItemDto } from './dtos/new-patient-item.dto';

@Injectable()
export class InsightsRepository {
  constructor(
    @InjectRepository(PatientDocument)
    private readonly patientDocumentRepo: Repository<PatientDocument>,
    @InjectRepository(PatientDoctorGrant)
    private readonly doctorGrantRepo: Repository<PatientDoctorGrant>,
    @InjectRepository(PatientInstitutionGrant)
    private readonly institutionGrantRepo: Repository<PatientInstitutionGrant>,
  ) {}

  // ── Patient totals ─────────────────────────────────────────────────────────

  public async countDocumentsByPatientId(patientId: string): Promise<number> {
    const raw = await this.patientDocumentRepo
      .createQueryBuilder('doc')
      .select('COUNT("doc"."id")', 'count')
      .where('"doc"."patient_id" = :patientId', { patientId })
      .andWhere('"doc"."deleted_at" IS NULL')
      .getRawOne<{ count: string }>();
    return Number.parseInt(raw?.count ?? '0', 10);
  }

  public async countActiveDoctorGrantsByPatientId(
    patientId: string,
  ): Promise<number> {
    const raw = await this.doctorGrantRepo
      .createQueryBuilder('grant')
      .select('COUNT("grant"."id")', 'count')
      .where('"grant"."patient_id" = :patientId', { patientId })
      .andWhere('"grant"."revoked_at" IS NULL')
      .andWhere('"grant"."deleted_at" IS NULL')
      .getRawOne<{ count: string }>();
    return Number.parseInt(raw?.count ?? '0', 10);
  }

  public async countActiveInstitutionGrantsByPatientId(
    patientId: string,
  ): Promise<number> {
    const raw = await this.institutionGrantRepo
      .createQueryBuilder('grant')
      .select('COUNT("grant"."id")', 'count')
      .where('"grant"."patient_id" = :patientId', { patientId })
      .andWhere('"grant"."revoked_at" IS NULL')
      .andWhere('"grant"."deleted_at" IS NULL')
      .getRawOne<{ count: string }>();
    return Number.parseInt(raw?.count ?? '0', 10);
  }

  // ── Doctor totals ──────────────────────────────────────────────────────────

  public async getDoctorGrantTotals(
    doctorId: string,
  ): Promise<{ total: number; thisMonth: number }> {
    const { startOfMonth, startOfNextMonth } = this.getCurrentMonthRange();
    const raw = await this.doctorGrantRepo
      .createQueryBuilder('grant')
      .select('COUNT("grant"."id")', 'total')
      .addSelect(
        `COUNT("grant"."id") FILTER (WHERE "grant"."created_at" >= :startOfMonth AND "grant"."created_at" < :startOfNextMonth)`,
        'thisMonth',
      )
      .where('"grant"."doctor_id" = :doctorId', { doctorId })
      .andWhere('"grant"."revoked_at" IS NULL')
      .andWhere('"grant"."deleted_at" IS NULL')
      .setParameters({ doctorId, startOfMonth, startOfNextMonth })
      .getRawOne<{ total: string; thisMonth: string }>();
    return {
      total: Number.parseInt(raw?.total ?? '0', 10),
      thisMonth: Number.parseInt(raw?.thisMonth ?? '0', 10),
    };
  }

  public async findRecentDoctorGrantPatients(
    doctorId: string,
    limit = 5,
  ): Promise<NewPatientItemDto[]> {
    const { startOfMonth, startOfNextMonth } = this.getCurrentMonthRange();
    const rows = await this.doctorGrantRepo
      .createQueryBuilder('grant')
      .innerJoin('grant.patient', 'patient')
      .innerJoin('patient.user', 'user')
      .select('"grant"."id"', 'grantId')
      .addSelect('"grant"."created_at"', 'grantedAt')
      .addSelect('"user"."name"', 'name')
      .where('"grant"."doctor_id" = :doctorId', { doctorId })
      .andWhere('"grant"."revoked_at" IS NULL')
      .andWhere('"grant"."deleted_at" IS NULL')
      .orderBy('"grant"."created_at"', 'DESC')
      .limit(limit)
      .getRawMany<{ grantId: string; grantedAt: string; name: string }>();
    return rows.map((row) => ({
      grantId: row.grantId,
      name: row.name,
      grantedAt: new Date(row.grantedAt),
      newPatient:
        new Date(row.grantedAt) >= startOfMonth &&
        new Date(row.grantedAt) < startOfNextMonth,
    }));
  }

  // ── Institution totals ─────────────────────────────────────────────────────

  public async getInstitutionGrantTotals(
    institutionId: string,
  ): Promise<{ total: number; thisMonth: number }> {
    const { startOfMonth, startOfNextMonth } = this.getCurrentMonthRange();
    const raw = await this.institutionGrantRepo
      .createQueryBuilder('grant')
      .select('COUNT("grant"."id")', 'total')
      .addSelect(
        `COUNT("grant"."id") FILTER (WHERE "grant"."created_at" >= :startOfMonth AND "grant"."created_at" < :startOfNextMonth)`,
        'thisMonth',
      )
      .where('"grant"."institution_id" = :institutionId', { institutionId })
      .andWhere('"grant"."revoked_at" IS NULL')
      .andWhere('"grant"."deleted_at" IS NULL')
      .setParameters({ institutionId, startOfMonth, startOfNextMonth })
      .getRawOne<{ total: string; thisMonth: string }>();
    return {
      total: Number.parseInt(raw?.total ?? '0', 10),
      thisMonth: Number.parseInt(raw?.thisMonth ?? '0', 10),
    };
  }

  public async findRecentInstitutionGrantPatients(
    institutionId: string,
    limit = 5,
  ): Promise<NewPatientItemDto[]> {
    const { startOfMonth, startOfNextMonth } = this.getCurrentMonthRange();
    const rows = await this.institutionGrantRepo
      .createQueryBuilder('grant')
      .innerJoin('grant.patient', 'patient')
      .innerJoin('patient.user', 'user')
      .select('"grant"."id"', 'grantId')
      .addSelect('"grant"."created_at"', 'grantedAt')
      .addSelect('"user"."name"', 'name')
      .where('"grant"."institution_id" = :institutionId', { institutionId })
      .andWhere('"grant"."revoked_at" IS NULL')
      .andWhere('"grant"."deleted_at" IS NULL')
      .orderBy('"grant"."created_at"', 'DESC')
      .limit(limit)
      .getRawMany<{ grantId: string; grantedAt: string; name: string }>();
    return rows.map((row) => ({
      grantId: row.grantId,
      name: row.name,
      grantedAt: new Date(row.grantedAt),
      newPatient:
        new Date(row.grantedAt) >= startOfMonth &&
        new Date(row.grantedAt) < startOfNextMonth,
    }));
  }

  // ── Profile picture lookup ─────────────────────────────────────────────────

  public async findPatientProfilePictureIdByDoctorGrantId(
    grantId: string,
    doctorId: string,
  ): Promise<string | null | undefined> {
    const result = await this.doctorGrantRepo
      .createQueryBuilder('grant')
      .innerJoin('grant.patient', 'patient')
      .innerJoin('patient.user', 'user')
      .leftJoin('user.profilePicture', 'profilePicture')
      .select('"grant"."id"', 'grantId')
      .addSelect('"profilePicture"."id"', 'profilePictureId')
      .where('"grant"."id" = :grantId', { grantId })
      .andWhere('"grant"."doctor_id" = :doctorId', { doctorId })
      .andWhere('"grant"."revoked_at" IS NULL')
      .andWhere('"grant"."deleted_at" IS NULL')
      .getRawOne<{ grantId: string; profilePictureId: string | null }>();

    if (!result) return undefined;
    return result.profilePictureId ?? null;
  }

  public async findPatientProfilePictureIdByInstitutionGrantId(
    grantId: string,
    institutionId: string,
  ): Promise<string | null | undefined> {
    const result = await this.institutionGrantRepo
      .createQueryBuilder('grant')
      .innerJoin('grant.patient', 'patient')
      .innerJoin('patient.user', 'user')
      .leftJoin('user.profilePicture', 'profilePicture')
      .select('"grant"."id"', 'grantId')
      .addSelect('"profilePicture"."id"', 'profilePictureId')
      .where('"grant"."id" = :grantId', { grantId })
      .andWhere('"grant"."institution_id" = :institutionId', { institutionId })
      .andWhere('"grant"."revoked_at" IS NULL')
      .andWhere('"grant"."deleted_at" IS NULL')
      .getRawOne<{ grantId: string; profilePictureId: string | null }>();

    if (!result) return undefined;
    return result.profilePictureId ?? null;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private getCurrentMonthRange(): {
    startOfMonth: Date;
    startOfNextMonth: Date;
  } {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { startOfMonth, startOfNextMonth };
  }
}
