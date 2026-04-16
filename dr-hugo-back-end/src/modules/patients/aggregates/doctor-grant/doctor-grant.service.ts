import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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
  private readonly logger = new Logger(DoctorGrantService.name);

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

  public async toggleDocumentAccess(
    grantId: string,
    userId: string,
    documentId: string,
  ): Promise<void> {
    const patientId = await this.patientService.findPatientIdByUserId(userId);

    const documentExists =
      await this.patientDocumentService.documentExistsByIdAndPatientId(
        documentId,
        patientId,
      );

    if (!documentExists) {
      throw new NotFoundException(
        'Documento não encontrado ou não pertence ao paciente',
      );
    }

    const affected = await this.repository.toggleDocumentId(
      grantId,
      patientId,
      documentId,
    );

    acceptFalseThrows(
      affected,
      () =>
        new NotFoundException(
          'Concessão não encontrada, revogada ou acesso não autorizado',
        ),
    );
  }

  public async toggleAllDocumentsAccess(
    grantId: string,
    userId: string,
  ): Promise<void> {
    const patientId = await this.patientService.findPatientIdByUserId(userId);

    const affected = await this.repository.toggleAllDocumentsAccess(
      grantId,
      patientId,
    );

    acceptFalseThrows(
      affected,
      () =>
        new NotFoundException(
          'Concessão não encontrada, revogada ou acesso não autorizado',
        ),
    );
  }

  public async togglePersistentAccess(
    grantId: string,
    userId: string,
  ): Promise<void> {
    const patientId = await this.patientService.findPatientIdByUserId(userId);

    const result = await this.repository.togglePersistent(grantId, patientId);

    acceptFalseThrows(
      result.affected,
      () =>
        new NotFoundException(
          'Concessão não encontrada, revogada ou acesso não autorizado',
        ),
    );

    if (!result.persistent && result.allowAccessToAllDocuments) {
      const hasExpired =
        result.allowAccessToAllDocumentsAt &&
        result.allowAccessToAllDocumentsAt.getTime() <=
          Date.now() - 24 * 60 * 60 * 1000;

      if (hasExpired) {
        await this.snapshotAndExpireGrant(grantId, patientId);
      }
    }
  }

  // ── Document access (read-only via grant) ────────────────────────────────

  public async findDocuments(
    userId: string,
    grantId: string,
    params: PaginationParams<PatientDocument>,
    userRole: UserRole,
  ): Promise<PatientDocumentPaginatedDto> {
    const grant = await this.resolveGrant(userId, grantId, userRole);

    if (userRole === UserRole.PATIENT) {
      const result = await this.patientDocumentService.findMonthly(
        userId,
        params,
        grant.patientId,
      );
      return {
        ...result,
        grantDocumentsIds: grant.documentsIds ?? [],
        allowAccessToAllDocuments: grant.allowAccessToAllDocuments,
        persistent: grant.persistent,
      };
    }

    if (grant.allowAccessToAllDocuments) {
      return this.patientDocumentService.findMonthly(
        userId,
        { ...params, filter: { ...params.filter } },
        grant.patientId,
      );
    }

    const accessibleIds = await this.resolveAccessibleDocumentIds(grant);

    if (!accessibleIds?.length) {
      return {
        items: {},
        totalItems: 0,
        totalPages: 0,
        currentPage: params.page ?? 1,
      };
    }

    return this.patientDocumentService.findMonthly(
      userId,
      { ...params, filter: { ...params.filter, id: { in: accessibleIds } } },
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

    if (userRole !== UserRole.PATIENT && !grant.allowAccessToAllDocuments) {
      const accessibleIds = await this.resolveAccessibleDocumentIds(grant);

      if (!accessibleIds?.includes(documentId)) {
        throw new NotFoundException(
          'Documento não encontrado ou acesso não autorizado',
        );
      }
    }

    return this.patientDocumentService.findById(
      userId,
      documentId,
      grant.patientId,
    );
  }

  public async findAvailableFilters(
    userId: string,
    grantId: string,
    userRole: UserRole,
  ): Promise<PatientDocumentAvailableFiltersDto> {
    const grant = await this.resolveGrant(userId, grantId, userRole);

    if (userRole === UserRole.PATIENT) {
      return this.patientDocumentService.findAvailableFilters(
        userId,
        grant.patientId,
      );
    }

    if (grant.allowAccessToAllDocuments) {
      return this.patientDocumentService.findAvailableFilters(
        userId,
        grant.patientId,
      );
    }

    const accessibleIds = await this.resolveAccessibleDocumentIds(grant);

    if (!accessibleIds?.length) {
      return {
        documentTypes: [],
        descriptions: [],
        doctors: [],
        locations: [],
        examDates: [],
      };
    }

    return this.patientDocumentService.findAvailableFilters(
      userId,
      grant.patientId,
      accessibleIds,
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

  private async resolveAccessibleDocumentIds(grant: {
    id: string;
    patientId: string;
    documentsIds: string[] | null;
    persistent: boolean;
    createdAt: Date;
  }): Promise<string[] | null> {
    if (!grant.persistent) {
      return grant.documentsIds?.length ? grant.documentsIds : null;
    }

    const newIds = await this.patientDocumentService.findIdsByCreatedAfter(
      grant.patientId,
      grant.createdAt,
    );

    if (!newIds.length) {
      return grant.documentsIds?.length ? grant.documentsIds : null;
    }

    const combined = [...new Set([...(grant.documentsIds ?? []), ...newIds])];
    await this.repository.updateDocumentsIds(grant.id, combined);

    return combined;
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

  @Cron(CronExpression.EVERY_MINUTE)
  public async expireAllDocumentsAccessForNonPersistentGrants(): Promise<void> {
    this.logger.log(
      'Verificando concessões de médico com acesso total a documentos expirado...',
    );

    const grants = await this.repository.findGrantsToExpireAllDocumentsAccess();

    if (!grants.length) return;

    await Promise.all(
      grants.map((grant) =>
        this.snapshotAndExpireGrant(
          grant.id,
          grant.patientId,
          grant.documentsIds,
        ),
      ),
    );

    this.logger.log(
      `${grants.length} concessão(ões) de médico com acesso total expirado(s).`,
    );
  }

  private async snapshotAndExpireGrant(
    grantId: string,
    patientId: string,
    existingDocumentsIds?: string[] | null,
  ): Promise<void> {
    const allIds =
      await this.patientDocumentService.findAllIdsByPatientId(patientId);

    const merged = [...new Set([...(existingDocumentsIds ?? []), ...allIds])];

    await this.repository.snapshotAndDisableAllDocumentsAccess(grantId, merged);
  }
}
