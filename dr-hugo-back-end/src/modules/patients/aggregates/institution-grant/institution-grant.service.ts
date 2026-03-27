import { Injectable, NotFoundException } from '@nestjs/common';
import { acceptFalseThrows } from 'src/core/utils/functions';
import { UserRole } from 'src/core/vo/consts/enums';
import { InstitutionService } from 'src/modules/institutions/institution.service';
import { PatientsService } from 'src/modules/patients/patients.service';
import { PatientDocumentService } from '../documents/patient-document.service';
import { CreatePatientDocumentDto } from '../documents/dtos/create-patient-document.dto';
import { PatientDocumentDto } from '../documents/dtos/patient-document.dto';
import { PatientDocumentPaginatedDto } from '../documents/dtos/patient-document-paginated.dto';
import { PatientDocumentAvailableFiltersDto } from '../documents/dtos/patient-document-available-filters.dto';
import { MediaService } from 'src/core/modules/media/media.service';
import type {
  MediaStreamResult,
  PaginationParams,
} from 'src/core/vo/types/types';
import { PatientDocument } from '../documents/entities/patient-document.entity';
import { InstitutionGrantRepository } from './institution-grant.repository';
import { InstitutionGrantMapper } from './institution-grant.mapper';
import { GrantedInstitutionDetailDto } from './dtos/granted-institution-detail.dto';
import { GrantedInstitutionPaginatedDto } from './dtos/granted-institution-paginated.dto';

@Injectable()
export class InstitutionGrantService {
  constructor(
    private readonly repository: InstitutionGrantRepository,
    private readonly mapper: InstitutionGrantMapper,
    private readonly patientDocumentService: PatientDocumentService,
    private readonly mediaService: MediaService,
    private readonly institutionService: InstitutionService,
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
          'Concessao nao encontrada, revogada ou acesso nao autorizado',
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
      [UserRole.INSTITUTION]: (userId) =>
        this.institutionService.findInstitutionIdByUserId(userId),
      [UserRole.ADMIN]: null,
      [UserRole.DOCTOR]: null,
    };
  }

  private getLikeTogglers(): Record<
    UserRole,
    (grantId: string, profileId: string) => Promise<boolean>
  > {
    return {
      [UserRole.PATIENT]: (grantId, patientId) =>
        this.repository.toggleLikedByPatient(grantId, patientId),
      [UserRole.INSTITUTION]: (grantId, institutionId) =>
        this.repository.toggleLikedByInstitution(grantId, institutionId),
      [UserRole.ADMIN]: null,
      [UserRole.DOCTOR]: null,
    };
  }

  public async createDocument(
    userId: string,
    grantId: string,
    dto: CreatePatientDocumentDto,
  ): Promise<PatientDocumentDto> {
    const { patientId, institutionId } = await this.resolveGrant(
      userId,
      grantId,
    );
    const created = await this.patientDocumentService.create(
      userId,
      dto,
      patientId,
    );
    await this.repository.appendDocumentToGrant(
      grantId,
      institutionId,
      created.id,
    );
    return created;
  }

  public async findDocuments(
    userId: string,
    grantId: string,
    params: PaginationParams<PatientDocument>,
  ): Promise<PatientDocumentPaginatedDto> {
    const grant = await this.resolveGrant(userId, grantId);

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
  ): Promise<PatientDocumentDto> {
    const grant = await this.resolveGrant(userId, grantId);

    if (!grant.documentsIds?.includes(documentId)) {
      throw new NotFoundException(
        'Documento nao encontrado ou acesso nao autorizado',
      );
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
  ): Promise<PatientDocumentAvailableFiltersDto> {
    const grant = await this.resolveGrant(userId, grantId);
    return this.patientDocumentService.findAvailableFilters(
      userId,
      grant.patientId,
      grant.documentsIds ?? undefined,
    );
  }

  public async getStream(
    userId: string,
    grantId: string,
    documentId: string,
    mediaId: string,
  ): Promise<MediaStreamResult> {
    const doc = await this.findDocumentById(userId, grantId, documentId);

    if (!doc.mediaIds?.includes(mediaId)) {
      throw new NotFoundException(
        'Arquivo nao pertence ao documento informado',
      );
    }

    return this.mediaService.getStreamGranted(mediaId);
  }

  public async downloadDocument(
    userId: string,
    grantId: string,
    documentId: string,
  ): Promise<MediaStreamResult> {
    const doc = await this.findDocumentById(userId, grantId, documentId);
    return this.mediaService.downloadGranted(doc.mediaIds);
  }

  public async updateDocument(
    userId: string,
    grantId: string,
    dto: PatientDocumentDto,
  ): Promise<void> {
    const { patientId, documentsIds } = await this.resolveGrant(
      userId,
      grantId,
    );
    if (!documentsIds?.includes(dto.id)) {
      throw new NotFoundException(
        'Documento nao encontrado ou acesso nao autorizado',
      );
    }
    return this.patientDocumentService.update(userId, dto, patientId);
  }

  public async renameDocument(
    userId: string,
    grantId: string,
    documentId: string,
    newDescription: string,
  ): Promise<void> {
    const { patientId, documentsIds } = await this.resolveGrant(
      userId,
      grantId,
    );
    if (!documentsIds?.includes(documentId)) {
      throw new NotFoundException(
        'Documento nao encontrado ou acesso nao autorizado',
      );
    }
    return this.patientDocumentService.rename(
      userId,
      documentId,
      newDescription,
      patientId,
    );
  }

  public async findGrantedInstitutionsPaginated(
    userId: string,
    params: PaginationParams<any>,
  ): Promise<GrantedInstitutionPaginatedDto> {
    const patientId = await this.patientService.findPatientIdByUserId(userId);
    const { items, totalItems } =
      await this.repository.findGrantedInstitutionsPaginated(patientId, params);

    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    return {
      items: items.map((g) => this.mapper.toListItem(g)),
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  public async findGrantedInstitutionByGrantId(
    userId: string,
    grantId: string,
  ): Promise<GrantedInstitutionDetailDto> {
    const patientId = await this.patientService.findPatientIdByUserId(userId);
    const grant = await this.repository.findGrantedInstitutionByGrantId(
      grantId,
      patientId,
    );

    if (!grant)
      throw new NotFoundException('Concessao ou instituicao nao encontrada');

    return this.mapper.toDetail(grant);
  }

  public async getInstitutionProfilePictureByGrantId(
    patientUserId: string,
    grantId: string,
  ): Promise<MediaStreamResult | null> {
    const patientId =
      await this.patientService.findPatientIdByUserId(patientUserId);

    const profilePictureId =
      await this.repository.findInstitutionProfilePictureIdByGrantId(
        grantId,
        patientId,
      );

    if (profilePictureId === undefined) {
      throw new NotFoundException(
        'Concessao nao encontrada ou acesso nao autorizado',
      );
    }

    if (!profilePictureId) return null;

    return this.mediaService.getStreamGranted(profilePictureId);
  }

  private applyGrantFilter(
    grant: {
      documentsIds: string[] | null;
    },
    params: PaginationParams<PatientDocument>,
  ): PaginationParams<PatientDocument> | null {
    if (!grant.documentsIds?.length) return null;

    return {
      ...params,
      filter: {
        ...params.filter,
        id: { in: grant.documentsIds },
      } as any,
    };
  }

  private async resolveGrant(userId: string, grantId: string) {
    const institutionId =
      await this.institutionService.findInstitutionIdByUserId(userId);
    const details = await this.repository.findGrantDetailsById(
      grantId,
      institutionId,
    );

    acceptFalseThrows(
      !!details,
      () =>
        new NotFoundException(
          'Concessao nao encontrada, revogada ou acesso nao autorizado',
        ),
    );

    return { institutionId, ...details };
  }
}
