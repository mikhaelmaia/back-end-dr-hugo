import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PatientAccessCodeRepository } from './patient-access-code.repository';
import { QrCodeService } from 'src/core/modules/qr-code/qr-code.service';
import { PatientAccessCode } from './entities/patient-access-code.entity';
import { until } from 'src/core/utils/functions';
import { generateSixDigitCode } from 'src/core/utils/utils';
import { PatientsService } from '../../patients.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PatientAccessCodeMapper } from './patient-access-code.mapper';
import { PatientAccessCodeDto } from './dtos/patient-access-code.dto';
import { CreatePatientAccessCodeDto } from './dtos/create-patient-access-code.dto';
import { InstitutionalUserRole } from 'src/core/vo/consts/enums';
import { ConfigService } from '@nestjs/config';
import { ResolutionKeyService } from 'src/core/modules/resolution-key/resolution-key.service';

@Injectable()
export class PatientAccessCodeService {
  private readonly logger = new Logger(PatientAccessCodeService.name);
  private readonly EXPIRATION_MINUTES = 5;
  private readonly CODE_TTL_SECONDS = this.EXPIRATION_MINUTES * 60;

  constructor(
    private readonly repository: PatientAccessCodeRepository,
    private readonly mapper: PatientAccessCodeMapper,
    private readonly patientService: PatientsService,
    private readonly qrCodeService: QrCodeService,
    private readonly resolutionKeyService: ResolutionKeyService,
    private readonly configService: ConfigService,
  ) {}

  public async createAccessCode(
    userId: string,
    dto: CreatePatientAccessCodeDto,
  ): Promise<PatientAccessCodeDto> {
    const patientId = await this.patientService.findPatientIdByUserId(userId);

    const entity = await this.generate(patientId, dto.role, dto.documentsIds, dto.persistent, dto.allowAccessToAllDocuments);

    const response = this.mapper.toDto(entity);

    response.qrCode = await this.generateQrCodeForAccessCode(entity.code);

    return response;
  }

  public async getExistingAccessCode(
    userId: string,
  ): Promise<PatientAccessCodeDto | null> {
    const patientId = await this.patientService.findPatientIdByUserId(userId);

    const entity = await this.repository.findActiveByPatient(patientId);

    if (!entity || entity.isExpired()) {
      return null;
    }

    const response = this.mapper.toDto(entity);

    response.qrCode = await this.generateQrCodeForAccessCode(entity.code);

    return response;
  }

  public async validateAccessCode(
    t: string,
    role: InstitutionalUserRole,
  ): Promise<PatientAccessCodeDto> {
    const code = await this.resolutionKeyService.resolve<{ code: string }>(t);

    const entity = await this.repository.findValidCodeByCodeAndRole(
      code.code,
      role,
    );

    if (!entity) {
      throw new NotFoundException('Código informado é inválido');
    }

    const wasMarkedAsUsed = await this.repository.markAsUsed(entity.id);

    if (!wasMarkedAsUsed) {
      throw new BadRequestException('Código já foi utilizado');
    }

    return this.mapper.toDto(entity);
  }

  public async deleteUnusedAndUnexpiredAccessCodeByPatientId(
    userId: string,
  ): Promise<void> {
    const patientId = await this.patientService.findPatientIdByUserId(userId);
    await this.repository.deleteUnusedAndUnexpiredByPatientId(patientId);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async deleteExpiredAccessCodes(): Promise<void> {
    this.logger.log('Iniciando limpeza de códigos de acesso expirados...');
    await this.repository.deleteExpiredUnused();
    this.logger.log('Limpeza de códigos expirados concluída.');
  }

  private async generate(
    patientId: string,
    role: InstitutionalUserRole,
    documentsIds?: string[],
    persistent?: boolean,
    allowAccessToAllDocuments?: boolean,
  ): Promise<PatientAccessCode> {
    let code = generateSixDigitCode();

    await until(
      async () => await this.repository.existsByCode(code),
      () => (code = generateSixDigitCode()),
    );

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.EXPIRATION_MINUTES);

    const entity = this.repository.create({
      code,
      role,
      documentsIds,
      persistent: persistent ?? false,
      allowAccessToAllDocuments: allowAccessToAllDocuments ?? false,
      patient: { id: patientId } as any,
      expiresAt,
      used: false,
    });

    return this.repository.save(entity);
  }

  private async generateQrCodeForAccessCode(code: string): Promise<string> {
    const url = `${this.configService.get('web.baseUrl')}${this.configService.get('web.permissionRequestPath')}?t=${await this.createEncryptedQueryParam(code)}`;
    return await this.qrCodeService.generateBase64(url);
  }

  private async createEncryptedQueryParam(code: string): Promise<string> {
    return this.resolutionKeyService.create({ code }, this.CODE_TTL_SECONDS);
  }
}
