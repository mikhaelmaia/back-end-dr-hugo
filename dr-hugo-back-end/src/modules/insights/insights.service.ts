import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from 'src/core/vo/consts/enums';
import { MediaStreamResult } from 'src/core/vo/types/types';
import { MediaService } from 'src/core/modules/media/media.service';
import { DoctorService } from '../doctors/doctor.service';
import { InstitutionService } from '../institutions/institution.service';
import { PatientsService } from '../patients/patients.service';
import { InsightsTotalsDto } from './dtos/insights-totals.dto';
import { NewPatientItemDto } from './dtos/new-patient-item.dto';
import { InsightsMapper } from './insights.mapper';
import { InsightsRepository } from './insights.repository';

@Injectable()
export class InsightsService {
  constructor(
    private readonly repository: InsightsRepository,
    private readonly mapper: InsightsMapper,
    private readonly patientService: PatientsService,
    private readonly doctorService: DoctorService,
    private readonly institutionService: InstitutionService,
    private readonly mediaService: MediaService,
  ) {}

  public async getTotals(
    userId: string,
    userRole: UserRole,
  ): Promise<InsightsTotalsDto> {
    if (userRole === UserRole.PATIENT) {
      return this.getPatientTotals(userId);
    }

    if (userRole === UserRole.DOCTOR) {
      return this.getDoctorTotals(userId);
    }

    return this.getInstitutionTotals(userId);
  }

  public async getNewPatients(
    userId: string,
    userRole: UserRole,
  ): Promise<NewPatientItemDto[]> {
    if (userRole === UserRole.DOCTOR) {
      const doctorId = await this.doctorService.findDoctorIdByUserId(userId);
      return this.repository.findRecentDoctorGrantPatients(doctorId);
    }

    const institutionId =
      await this.institutionService.findInstitutionIdByUserId(userId);
    return this.repository.findRecentInstitutionGrantPatients(institutionId);
  }

  public async getPatientProfilePicture(
    userId: string,
    userRole: UserRole,
    grantId: string,
  ): Promise<MediaStreamResult | null> {
    const profilePictureId =
      userRole === UserRole.DOCTOR
        ? await this.getProfilePictureIdForDoctor(userId, grantId)
        : await this.getProfilePictureIdForInstitution(userId, grantId);

    if (profilePictureId === undefined) {
      throw new NotFoundException(
        'Concessão não encontrada ou acesso não autorizado',
      );
    }

    if (!profilePictureId) return null;

    return this.mediaService.getStreamGranted(profilePictureId);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async getPatientTotals(userId: string): Promise<InsightsTotalsDto> {
    const patientId = await this.patientService.findPatientIdByUserId(userId);

    const [totalDocuments, totalDoctorsGranted, totalInstitutionsGranted] =
      await Promise.all([
        this.repository.countDocumentsByPatientId(patientId),
        this.repository.countActiveDoctorGrantsByPatientId(patientId),
        this.repository.countActiveInstitutionGrantsByPatientId(patientId),
      ]);

    return this.mapper.toPatientTotals(
      totalDocuments,
      totalDoctorsGranted,
      totalInstitutionsGranted,
    );
  }

  private async getDoctorTotals(userId: string): Promise<InsightsTotalsDto> {
    const doctorId = await this.doctorService.findDoctorIdByUserId(userId);
    const { total, thisMonth } =
      await this.repository.getDoctorGrantTotals(doctorId);
    return this.mapper.toGranteeTotals(total, thisMonth);
  }

  private async getInstitutionTotals(
    userId: string,
  ): Promise<InsightsTotalsDto> {
    const institutionId =
      await this.institutionService.findInstitutionIdByUserId(userId);
    const { total, thisMonth } =
      await this.repository.getInstitutionGrantTotals(institutionId);
    return this.mapper.toGranteeTotals(total, thisMonth);
  }

  private async getProfilePictureIdForDoctor(
    userId: string,
    grantId: string,
  ): Promise<string | null | undefined> {
    const doctorId = await this.doctorService.findDoctorIdByUserId(userId);
    return this.repository.findPatientProfilePictureIdByDoctorGrantId(
      grantId,
      doctorId,
    );
  }

  private async getProfilePictureIdForInstitution(
    userId: string,
    grantId: string,
  ): Promise<string | null | undefined> {
    const institutionId =
      await this.institutionService.findInstitutionIdByUserId(userId);
    return this.repository.findPatientProfilePictureIdByInstitutionGrantId(
      grantId,
      institutionId,
    );
  }
}
