import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { acceptFalseThrows, acceptTrueThrows } from 'src/core/utils/functions';
import { InstitutionalUserRole, UserRole } from 'src/core/vo/consts/enums';
import { UserDto } from 'src/modules/users/dtos/user.dto';
import { NotificationEvents } from 'src/core/modules/notifications/events/notification-events';
import { AccessCodeUsedPayload } from 'src/core/modules/notifications/events/notification-payloads';
import { NotificationsService } from 'src/core/modules/notifications/notifications.service';
import { DoctorService } from 'src/modules/doctors/doctor.service';
import { InstitutionService } from 'src/modules/institutions/institution.service';
import { PatientsService } from 'src/modules/patients/patients.service';
import { MediaService } from 'src/core/modules/media/media.service';
import type {
  MediaStreamResult,
  PaginationParams,
} from 'src/core/vo/types/types';
import { PatientAccessCodeDto } from '../access-code/dtos/patient-access-code.dto';
import { PatientAccessCodeService } from '../access-code/patient-access-code.service';
import { CreatePatientPermissionGrantDto } from './dtos/create-patient-permission-grant.dto';
import { GrantedPatientDetailDto } from './dtos/granted-patient-detail.dto';
import { GrantedPatientPaginatedDto } from './dtos/granted-patient-paginated.dto';
import { PatientPermissionGrantDto } from './dtos/patient-permission-grant.dto';
import { RevokePatientPermissionGrantDto } from './dtos/revoke-patient-permission-grant.dto';
import { PatientMedicalRecordService } from 'src/modules/medical-records/medical-record.service';
import { GrantedPatientMedicalRecordDto } from './dtos/granted-patient-medical-record.dto';
import { PatientPermissionGrantRepository } from './patient-permission-grant.repository';
import { PatientPermissionGrantMapper } from './patient-permission-grant.mapper';
import { WhatsAppHelper } from 'src/core/modules/whatsapp/whatsapp.helper';

@Injectable()
export class PatientPermissionGrantService {
  private readonly logger = new Logger(PatientPermissionGrantService.name);

  constructor(
    private readonly repository: PatientPermissionGrantRepository,
    private readonly mapper: PatientPermissionGrantMapper,
    private readonly accessCodeService: PatientAccessCodeService,
    private readonly doctorService: DoctorService,
    private readonly institutionService: InstitutionService,
    private readonly patientService: PatientsService,
    private readonly notificationsService: NotificationsService,
    private readonly mediaService: MediaService,
    private readonly medicalRecordService: PatientMedicalRecordService,
    private readonly whatsAppHelper: WhatsAppHelper,
  ) {}

  public async createGrant(
    user: UserDto,
    dto: CreatePatientPermissionGrantDto,
  ): Promise<PatientPermissionGrantDto> {
    const institutionalRole = this.toInstitutionalRole(user.role);
    const accessCodeData = await this.accessCodeService.validateAccessCode(
      dto.t,
      institutionalRole,
    );
    return this.getCreatorFor(institutionalRole)(user, accessCodeData);
  }

  public async revokeGrant(
    user: UserDto,
    dto: RevokePatientPermissionGrantDto,
  ): Promise<void> {
    if (user.role === UserRole.PATIENT) {
      const patientId = await this.patientService.findPatientIdByUserId(
        user.id,
      );
      return this.getRevokerFor(dto.role)(dto.id, patientId);
    } else if (user.role === UserRole.DOCTOR) {
      if (dto.role !== InstitutionalUserRole.DOCTOR) {
        throw new BadRequestException(
          'Role deve ser DOCTOR quando médico está revogando sua própria concessão',
        );
      }
      return this.revokeDoctorGrantByDoctorUser(user.id, dto.id);
    } else if (user.role === UserRole.INSTITUTION) {
      if (dto.role !== InstitutionalUserRole.INSTITUTION) {
        throw new BadRequestException(
          'Role deve ser INSTITUTION quando instituição está revogando sua própria concessão',
        );
      }
      return this.revokeInstitutionGrantByInstitutionUser(user.id, dto.id);
    }

    throw new BadRequestException(
      'Tipo de usuário não autorizado para revogar concessões',
    );
  }

  public async toggleLike(grantId: string, user: UserDto): Promise<void> {
    const profileResolver = this.getProfileResolvers()[user.role];
    const likeToggler = this.getLikeTogglers()[user.role];

    if (!profileResolver || !likeToggler) {
      throw new BadRequestException(
        'Tipo de usuário não autorizado para curtir concessões',
      );
    }

    const profileId = await profileResolver(user.id);
    const affected = await likeToggler(grantId, profileId);

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
      [UserRole.INSTITUTION]: (userId) =>
        this.institutionService.findInstitutionIdByUserId(userId),
      [UserRole.ADMIN]: null,
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
      [UserRole.INSTITUTION]: (grantId, institutionId) =>
        this.repository.toggleLikedByInstitution(grantId, institutionId),
      [UserRole.ADMIN]: null,
    };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async revokeExpiredNonPersistentGrants(): Promise<void> {
    this.logger.log(
      'Iniciando revogação de concessões temporárias expiradas...',
    );
    await this.repository.revokeExpiredNonPersistentGrants();
    this.logger.log('Revogação de concessões temporárias expiradas concluída.');
  }

  private toInstitutionalRole(userRole: UserRole): InstitutionalUserRole {
    const roleMap: Partial<Record<UserRole, InstitutionalUserRole>> = {
      [UserRole.DOCTOR]: InstitutionalUserRole.DOCTOR,
      [UserRole.INSTITUTION]: InstitutionalUserRole.INSTITUTION,
    };
    return roleMap[userRole];
  }

  private getCreatorFor(
    role: InstitutionalUserRole,
  ): (
    user: UserDto,
    accessCodeData: PatientAccessCodeDto,
  ) => Promise<PatientPermissionGrantDto> {
    return {
      [InstitutionalUserRole.DOCTOR]: (
        user: UserDto,
        data: PatientAccessCodeDto,
      ) => this.createDoctorGrant(user, data),
      [InstitutionalUserRole.INSTITUTION]: (
        user: UserDto,
        data: PatientAccessCodeDto,
      ) => this.createInstitutionGrant(user, data),
    }[role];
  }

  private getRevokerFor(
    role: InstitutionalUserRole,
  ): (grantId: string, patientId: string) => Promise<void> {
    return {
      [InstitutionalUserRole.DOCTOR]: (grantId: string, patientId: string) =>
        this.revokeDoctorGrantInternal(grantId, patientId),
      [InstitutionalUserRole.INSTITUTION]: (
        grantId: string,
        patientId: string,
      ) => this.revokeInstitutionGrantInternal(grantId, patientId),
    }[role];
  }

  private async createDoctorGrant(
    user: UserDto,
    accessCodeData: PatientAccessCodeDto,
  ): Promise<PatientPermissionGrantDto> {
    const doctorId = await this.doctorService.findDoctorIdByUserId(user.id);

    acceptTrueThrows(
      await this.repository.existsActiveDoctorGrant(
        accessCodeData.patientId,
        doctorId,
      ),
      () =>
        new ConflictException(
          'Já existe uma concessão ativa para este paciente e médico',
        ),
    );

    const result = await this.repository.insertDoctorGrant({
      patient: { id: accessCodeData.patientId } as any,
      doctor: { id: doctorId } as any,
      documentsIds: accessCodeData.documentsIds,
      persistent: accessCodeData.persistent,
      allowAccessToAllDocuments: accessCodeData.allowAccessToAllDocuments,
      likedByPatient: false,
      likedByDoctor: false,
    });

    const dto = this.mapper.doctorGrantToDto({
      id: result.identifiers[0].id,
      patient: { id: accessCodeData.patientId } as any,
      doctor: { id: doctorId } as any,
      documentsIds: accessCodeData.documentsIds,
      persistent: accessCodeData.persistent,
      allowAccessToAllDocuments: accessCodeData.allowAccessToAllDocuments,
      likedByPatient: false,
      likedByDoctor: false,
      revokedAt: null,
      createdAt: new Date(),
    } as any);

    const payload: AccessCodeUsedPayload = {
      grantId: dto.id,
      granteeRole: InstitutionalUserRole.DOCTOR,
      granteeName: user.name,
    };
    this.notificationsService.emitToPatient(
      accessCodeData.patientId,
      NotificationEvents.ACCESS_CODE_USED,
      payload,
    );

    this.notifyPatientOfDoctorGrant(
      accessCodeData.patientId,
      user.name,
      dto.id,
      accessCodeData.persistent,
    ).catch((err) =>
      this.logger.error(
        'Falha ao enviar notificação WhatsApp de vínculo com médico',
        err instanceof Error ? err.message : String(err),
      ),
    );

    this.notifyDoctorOfPatientGrant(
      user.id,
      user.name,
      doctorId,
      accessCodeData.patientId,
      dto.id,
      accessCodeData.persistent,
    ).catch((err) =>
      this.logger.error(
        'Falha ao enviar notificação WhatsApp ao médico sobre novo vínculo',
        err instanceof Error ? err.message : String(err),
      ),
    );

    return dto;
  }

  private async createInstitutionGrant(
    user: UserDto,
    accessCodeData: PatientAccessCodeDto,
  ): Promise<PatientPermissionGrantDto> {
    const institutionId =
      await this.institutionService.findInstitutionIdByUserId(user.id);

    acceptTrueThrows(
      await this.repository.existsActiveInstitutionGrant(
        accessCodeData.patientId,
        institutionId,
      ),
      () =>
        new ConflictException(
          'Já existe uma concessão ativa para este paciente e instituição',
        ),
    );

    const result = await this.repository.insertInstitutionGrant({
      patient: { id: accessCodeData.patientId } as any,
      institution: { id: institutionId } as any,
      documentsIds: accessCodeData.documentsIds,
      persistent: accessCodeData.persistent,
      allowAccessToAllDocuments: accessCodeData.allowAccessToAllDocuments,
      likedByPatient: false,
      likedByInstitution: false,
    });

    const dto = this.mapper.institutionGrantToDto({
      id: result.identifiers[0].id,
      patient: { id: accessCodeData.patientId } as any,
      institution: { id: institutionId } as any,
      documentsIds: accessCodeData.documentsIds,
      persistent: accessCodeData.persistent,
      allowAccessToAllDocuments: accessCodeData.allowAccessToAllDocuments,
      likedByPatient: false,
      likedByInstitution: false,
      revokedAt: null,
      createdAt: new Date(),
    } as any);

    const payload: AccessCodeUsedPayload = {
      grantId: dto.id,
      granteeRole: InstitutionalUserRole.INSTITUTION,
      granteeName: user.name,
    };
    this.notificationsService.emitToPatient(
      accessCodeData.patientId,
      NotificationEvents.ACCESS_CODE_USED,
      payload,
    );

    this.notifyPatientOfInstitutionGrant(
      accessCodeData.patientId,
      user.name,
      dto.id,
      accessCodeData.persistent,
    ).catch((err) =>
      this.logger.error(
        'Falha ao enviar notificação WhatsApp de vínculo com instituição',
        err instanceof Error ? err.message : String(err),
      ),
    );

    this.notifyInstitutionOfPatientGrant(
      user.id,
      user.name,
      institutionId,
      accessCodeData.patientId,
      dto.id,
      accessCodeData.persistent,
    ).catch((err) =>
      this.logger.error(
        'Falha ao enviar notificação WhatsApp à instituição sobre novo vínculo',
        err instanceof Error ? err.message : String(err),
      ),
    );

    return dto;
  }

  private async notifyPatientOfDoctorGrant(
    patientId: string,
    doctorName: string,
    grantId: string,
    persistent: boolean,
  ): Promise<void> {
    const patient = await this.patientService.findById(patientId);
    const phone = `${patient.countryIdd.replace(/^\+/, '')}${patient.phone}`;
    await this.whatsAppHelper.sendPatientDoctorGrantNotification(phone, {
      patientName: patient.name,
      doctorName,
      grantedAt: new Date(),
      persistent,
      grantId,
    });
  }

  private async notifyPatientOfInstitutionGrant(
    patientId: string,
    institutionName: string,
    grantId: string,
    persistent: boolean,
  ): Promise<void> {
    const patient = await this.patientService.findById(patientId);
    const phone = `${patient.countryIdd.replace(/^\+/, '')}${patient.phone}`;
    await this.whatsAppHelper.sendPatientInstitutionGrantNotification(phone, {
      patientName: patient.name,
      institutionName,
      grantedAt: new Date(),
      persistent,
      grantId,
    });
  }

  private async notifyDoctorOfPatientGrant(
    doctorUserId: string,
    doctorName: string,
    doctorId: string,
    patientId: string,
    grantId: string,
    persistent: boolean,
  ): Promise<void> {
    const [doctor, patient] = await Promise.all([
      this.doctorService.findById(doctorId),
      this.patientService.findById(patientId),
    ]);
    const phone = `${doctor.countryIdd.replace(/^\+/, '')}${doctor.phone}`;
    await this.whatsAppHelper.sendDoctorReceivePatientGrantNotification(phone, {
      doctorName,
      patientName: patient.name,
      grantedAt: new Date(),
      persistent,
      grantId,
    });
  }

  private async notifyInstitutionOfPatientGrant(
    institutionUserId: string,
    institutionName: string,
    institutionId: string,
    patientId: string,
    grantId: string,
    persistent: boolean,
  ): Promise<void> {
    const [institution, patient] = await Promise.all([
      this.institutionService.findById(institutionId),
      this.patientService.findById(patientId),
    ]);
    const phone = `${institution.countryIdd.replace(/^\+/, '')}${institution.phone}`;
    await this.whatsAppHelper.sendInstitutionReceivePatientGrantNotification(
      phone,
      {
        institutionName,
        patientName: patient.name,
        grantedAt: new Date(),
        persistent,
        grantId,
      },
    );
  }

  private async revokeDoctorGrantInternal(
    grantId: string,
    patientId: string,
  ): Promise<void> {
    acceptFalseThrows(
      await this.repository.existsDoctorGrantByIdAndPatientId(
        grantId,
        patientId,
      ),
      () => new NotFoundException('Concessão não encontrada'),
    );
    acceptTrueThrows(
      await this.repository.existsRevokedDoctorGrantByIdAndPatientId(
        grantId,
        patientId,
      ),
      () => new BadRequestException('Concessão já foi revogada'),
    );
    await this.repository.revokeDoctorGrant(grantId, patientId);
  }

  private async revokeInstitutionGrantInternal(
    grantId: string,
    patientId: string,
  ): Promise<void> {
    acceptFalseThrows(
      await this.repository.existsInstitutionGrantByIdAndPatientId(
        grantId,
        patientId,
      ),
      () => new NotFoundException('Concessão não encontrada'),
    );
    acceptTrueThrows(
      await this.repository.existsRevokedInstitutionGrantByIdAndPatientId(
        grantId,
        patientId,
      ),
      () => new BadRequestException('Concessão já foi revogada'),
    );
    await this.repository.revokeInstitutionGrant(grantId, patientId);
  }

  private async revokeDoctorGrantByDoctorUser(
    userId: string,
    grantId: string,
  ): Promise<void> {
    const doctorId = await this.doctorService.findDoctorIdByUserId(userId);

    const grant = await this.repository.findDoctorGrantByIdAndDoctorId(
      grantId,
      doctorId,
    );

    acceptFalseThrows(
      !!grant,
      () =>
        new NotFoundException(
          'Concessão não encontrada ou acesso não autorizado',
        ),
    );

    acceptTrueThrows(
      !!grant.revokedAt,
      () => new BadRequestException('Concessão já foi revogada'),
    );

    await this.repository.revokeDoctorGrant(grantId, grant.patientId);
  }

  private async revokeInstitutionGrantByInstitutionUser(
    userId: string,
    grantId: string,
  ): Promise<void> {
    const institutionId =
      await this.institutionService.findInstitutionIdByUserId(userId);

    const grant =
      await this.repository.findInstitutionGrantByIdAndInstitutionId(
        grantId,
        institutionId,
      );

    acceptFalseThrows(
      !!grant,
      () =>
        new NotFoundException(
          'Concessão não encontrada ou acesso não autorizado',
        ),
    );

    acceptTrueThrows(
      !!grant.revokedAt,
      () => new BadRequestException('Concessão já foi revogada'),
    );

    await this.repository.revokeInstitutionGrant(grantId, grant.patientId);
  }

  public async findGrantedPatientsPaginated(
    user: UserDto,
    params: PaginationParams<any>,
  ): Promise<GrantedPatientPaginatedDto> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const profileId = await this.getProfileIdResolvers()[user.role](user.id);
    const { items, totalItems } = await this.getPatientFinders()[user.role](
      profileId,
      params,
    );

    return {
      items,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  public async findGrantedPatientByGrantId(
    user: UserDto,
    grantId: string,
  ): Promise<GrantedPatientDetailDto> {
    const profileId = await this.getProfileIdResolvers()[user.role](user.id);
    const patient = await this.getPatientByGrantIdFinders()[user.role](
      grantId,
      profileId,
    );

    if (!patient)
      throw new NotFoundException('Concessão ou paciente não encontrado');

    return patient;
  }

  public async getPatientProfilePictureByGrantId(
    user: UserDto,
    grantId: string,
  ): Promise<MediaStreamResult | null> {
    const profileId = await this.getProfileIdResolvers()[user.role](user.id);
    const profilePictureId = await this.getProfilePictureFinders()[user.role](
      grantId,
      profileId,
    );

    if (profilePictureId === undefined)
      throw new NotFoundException(
        'Concessão não encontrada ou acesso não autorizado',
      );

    if (!profilePictureId) return null;

    return this.mediaService.getStreamGranted(profilePictureId);
  }

  public async getGrantedPatientMedicalRecord(
    doctorUserId: string,
    grantId: string,
  ): Promise<GrantedPatientMedicalRecordDto> {
    const doctorId =
      await this.doctorService.findDoctorIdByUserId(doctorUserId);
    const patientDetail =
      await this.repository.findGrantedPatientByGrantIdForDoctor(
        grantId,
        doctorId,
      );

    if (!patientDetail)
      throw new NotFoundException('Concessão ou paciente não encontrado');

    const medicalRecord =
      await this.medicalRecordService.findMedicalRecordByPatientId(
        patientDetail.patientId,
      );

    return { ...patientDetail, medicalRecord };
  }

  private getProfileIdResolvers(): Record<
    UserRole,
    (userId: string) => Promise<string>
  > {
    return {
      [UserRole.DOCTOR]: (userId) =>
        this.doctorService.findDoctorIdByUserId(userId),
      [UserRole.INSTITUTION]: (userId) =>
        this.institutionService.findInstitutionIdByUserId(userId),
      [UserRole.PATIENT]: null,
      [UserRole.ADMIN]: null,
    };
  }

  private getPatientFinders(): Record<
    UserRole,
    (
      profileId: string,
      params: PaginationParams<any>,
    ) => Promise<{ items: any[]; totalItems: number }>
  > {
    return {
      [UserRole.DOCTOR]: (doctorId, params) =>
        this.repository.findGrantedPatientsForDoctor(doctorId, params),
      [UserRole.INSTITUTION]: (institutionId, params) =>
        this.repository.findGrantedPatientsForInstitution(
          institutionId,
          params,
        ),
      [UserRole.PATIENT]: null,
      [UserRole.ADMIN]: null,
    };
  }

  private getPatientByGrantIdFinders(): Record<
    UserRole,
    (
      grantId: string,
      profileId: string,
    ) => Promise<GrantedPatientDetailDto | null>
  > {
    return {
      [UserRole.DOCTOR]: (grantId, doctorId) =>
        this.repository.findGrantedPatientByGrantIdForDoctor(grantId, doctorId),
      [UserRole.INSTITUTION]: (grantId, institutionId) =>
        this.repository.findGrantedPatientByGrantIdForInstitution(
          grantId,
          institutionId,
        ),
      [UserRole.PATIENT]: null,
      [UserRole.ADMIN]: null,
    };
  }

  private getProfilePictureFinders(): Record<
    UserRole,
    (grantId: string, profileId: string) => Promise<string | null | undefined>
  > {
    return {
      [UserRole.DOCTOR]: (grantId, doctorId) =>
        this.repository.findPatientProfilePictureIdByGrantIdForDoctor(
          grantId,
          doctorId,
        ),
      [UserRole.INSTITUTION]: (grantId, institutionId) =>
        this.repository.findPatientProfilePictureIdByGrantIdForInstitution(
          grantId,
          institutionId,
        ),
      [UserRole.PATIENT]: null,
      [UserRole.ADMIN]: null,
    };
  }
}
