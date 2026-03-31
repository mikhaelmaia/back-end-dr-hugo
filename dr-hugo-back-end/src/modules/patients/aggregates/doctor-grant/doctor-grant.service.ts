import { Injectable, NotFoundException } from '@nestjs/common';
import { acceptFalseThrows } from 'src/core/utils/functions';
import { UserRole } from 'src/core/vo/consts/enums';
import { DoctorService } from 'src/modules/doctors/doctor.service';
import { PatientsService } from 'src/modules/patients/patients.service';
import { PatientDocumentService } from '../documents/patient-document.service';
import { PatientDocumentDto } from '../documents/dtos/patient-document.dto';
import { PatientDocumentPaginatedDto } from '../documents/dtos/patient-document-paginated.dto';
import { PatientDocumentAvailableFiltersDto } from '../documents/dtos/patient-document-available-filters.dto';
import { MediaService } from 'src/core/modules/media/media.service';
import type {
  MediaStreamResult,
  PaginationParams,
} from 'src/core/vo/types/types';
import { PatientDocument } from '../documents/entities/patient-document.entity';
import { DoctorGrantRepository } from './doctor-grant.repository';
import { DoctorGrantMapper } from './doctor-grant.mapper';
import { GrantedDoctorDetailDto } from './dtos/granted-doctor-detail.dto';
import { GrantedDoctorPaginatedDto } from './dtos/granted-doctor-paginated.dto';

@Injectable()
export class DoctorGrantService {
  constructor(
    private readonly repository: DoctorGrantRepository,
    private readonly mapper: DoctorGrantMapper,
    private readonly patientDocumentService: PatientDocumentService,
    private readonly mediaService: MediaService,
    private readonly doctorService: DoctorService,
    private readonly patientService: PatientsService,
  ) {}

  public async toggleLike(
    grantId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const profileId = await this.getProfileResolvers()[userRole](userId);
    const affected = await this.getLikeTogglers()[userRole](grantId, profileId);
    acceptFalseThrows(
      affected,
      () =>
        new NotFoundException(
          'Concessão não encontrada, revogada ou acesso não autorizado',
        ),
    );
  }

  private getProfileResolvers(): Record<
    UserRole,
    (userId: string) => Promise<string>
  > {
    return {
      [UserRole.PATIENT]: (userId) =>
        this.patientService.findPatientIdByUserId(userId),
      [UserRole.DOCTOR]: (userId) =>
        this.doctorService.findDoctorIdByUserId(userId),
      [UserRole.ADMIN]: null,
      [UserRole.INSTITUTION]: null,
    };
  }

  private getLikeTogglers(): Record<
    UserRole,
    (grantId: string, profileId: string) => Promise<boolean>
  > {
    return {
      [UserRole.PATIENT]: (grantId, patientId) =>
        this.repository.toggleLikedByPatient(grantId, patientId),
      [UserRole.DOCTOR]: (grantId, doctorId) =>
        this.repository.toggleLikedByDoctor(grantId, doctorId),
      [UserRole.ADMIN]: null,
      [UserRole.INSTITUTION]: null,
    };
  }

  // ── Document access (read-only via grant) ────────────────────────────────

  public async findDocuments(
    userId: string,
    grantId: string,
    params: PaginationParams<PatientDocument>,
    userRole: UserRole,
  ): Promise<PatientDocumentPaginatedDto> {
    const grant = await this.resolveGrant(userId, grantId, userRole);

    const enrichedParams = this.applyGrantFilter(grant, params);
    if (!enrichedParams) {
      return {
        items: {},
        totalItems: 0,
        totalPages: 0,
        currentPage: params.page ?? 1,
      };
    }

    return this.patientDocumentService.findMonthly(
      userId,
      enrichedParams,
      grant.patientId,
    );
  }

  public async findDocumentById(
    userId: string,
    grantId: string,
    documentId: string,
    userRole: UserRole,
  ): Promise<PatientDocumentDto> {
    const grant = await this.resolveGrant(userId, grantId, userRole);

    if (!grant.allowAccessToAllDocuments) {
      if (!grant.persistent && !grant.documentsIds?.includes(documentId)) {
        throw new NotFoundException(
          'Documento não encontrado ou acesso não autorizado',
        );
      }
    }

    const doc = await this.patientDocumentService.findById(
      userId,
      documentId,
      grant.patientId,
    );

    if (
      !grant.allowAccessToAllDocuments &&
      grant.persistent &&
      doc.createdAt < grant.createdAt
    ) {
      throw new NotFoundException(
        'Documento não encontrado ou acesso não autorizado',
      );
    }

    return doc;
  }

  public async findAvailableFilters(
    userId: string,
    grantId: string,
    userRole: UserRole,
  ): Promise<PatientDocumentAvailableFiltersDto> {
    const grant = await this.resolveGrant(userId, grantId, userRole);
    const scopedIds =
      grant.allowAccessToAllDocuments || grant.persistent
        ? undefined
        : (grant.documentsIds ?? undefined);
    return this.patientDocumentService.findAvailableFilters(
      userId,
      grant.patientId,
      scopedIds,
    );
  }

  public async getStream(
    userId: string,
    grantId: string,
    documentId: string,
    mediaId: string,
    userRole: UserRole,
  ): Promise<MediaStreamResult> {
    const doc = await this.findDocumentById(
      userId,
      grantId,
      documentId,
      userRole,
    );

    if (!doc.mediaIds?.includes(mediaId)) {
      throw new NotFoundException(
        'Arquivo não pertence ao documento informado',
      );
    }

    return this.mediaService.getStreamGranted(mediaId);
  }

  public async downloadDocument(
    userId: string,
    grantId: string,
    documentId: string,
    userRole: UserRole,
  ): Promise<MediaStreamResult> {
    const doc = await this.findDocumentById(
      userId,
      grantId,
      documentId,
      userRole,
    );
    return this.mediaService.downloadGranted(doc.mediaIds);
  }

  // ── Patient-facing: see which doctors have access ─────────────────────────

  public async findGrantedDoctorsPaginated(
    userId: string,
    params: PaginationParams<any>,
  ): Promise<GrantedDoctorPaginatedDto> {
    const patientId = await this.patientService.findPatientIdByUserId(userId);
    const { items, totalItems } =
      await this.repository.findGrantedDoctorsPaginated(patientId, params);

    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    return {
      items: items.map((g) => this.mapper.toListItem(g)),
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  public async findGrantedDoctorByGrantId(
    userId: string,
    grantId: string,
  ): Promise<GrantedDoctorDetailDto> {
    const patientId = await this.patientService.findPatientIdByUserId(userId);
    const grant = await this.repository.findGrantedDoctorByGrantId(
      grantId,
      patientId,
    );

    if (!grant)
      throw new NotFoundException('Concessão ou médico não encontrado');

    return this.mapper.toDetail(grant);
  }

  public async getDoctorProfilePictureByGrantId(
    patientUserId: string,
    grantId: string,
  ): Promise<MediaStreamResult | null> {
    const patientId =
      await this.patientService.findPatientIdByUserId(patientUserId);

    const profilePictureId =
      await this.repository.findDoctorProfilePictureIdByGrantId(
        grantId,
        patientId,
      );

    if (profilePictureId === undefined) {
      throw new NotFoundException(
        'Concessão não encontrada ou acesso não autorizado',
      );
    }

    if (!profilePictureId) return null;

    return this.mediaService.getStreamGranted(profilePictureId);
  }

  private applyGrantFilter(
    grant: {
      documentsIds: string[] | null;
      persistent: boolean;
      allowAccessToAllDocuments: boolean;
      createdAt: Date;
    },
    params: PaginationParams<PatientDocument>,
  ): PaginationParams<PatientDocument> | null {
    if (grant.allowAccessToAllDocuments) {
      return { ...params, filter: { ...params.filter } };
    }

    if (!grant.persistent && !grant.documentsIds?.length) return null;

    const enriched: PaginationParams<PatientDocument> = {
      ...params,
      filter: { ...params.filter },
    };

    if (grant.persistent) {
      (enriched.filter as any).createdAt = { gte: grant.createdAt };
    } else {
      (enriched.filter as any).id = { in: grant.documentsIds };
    }

    return enriched;
  }

  private async resolveGrant(
    userId: string,
    grantId: string,
    userRole: UserRole,
  ) {
    if (userRole === UserRole.PATIENT) {
      const patientId = await this.patientService.findPatientIdByUserId(userId);
      const grant = await this.repository.findGrantDetailsByIdForPatient(
        grantId,
        patientId,
      );

      acceptFalseThrows(
        !!grant,
        () =>
          new NotFoundException(
            'Concessão não encontrada, revogada ou acesso não autorizado',
          ),
      );

      return grant;
    }

    const doctorId = await this.doctorService.findDoctorIdByUserId(userId);
    const grant = await this.repository.findGrantDetailsById(grantId, doctorId);

    acceptFalseThrows(
      !!grant,
      () =>
        new NotFoundException(
          'Concessão não encontrada, revogada ou acesso não autorizado',
        ),
    );

    return grant;
  }
}
