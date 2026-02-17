import { Injectable, Logger } from '@nestjs/common';
import { PatientAccessCodeRepository } from './patient-access-code.repository';
import { QrCodeService } from 'src/core/modules/qr-code/qr-code.service';
import { PatientAccessCode } from './entities/patient-access-code.entity';
import { until } from 'src/core/utils/functions';
import { generateSixDigitCode } from 'src/core/utils/utils';
import { PatientsService } from '../../patients.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PatientAccessCodeMapper } from './patient-access-code.mapper';
import { PatientAccessCodeDto } from './dtos/patient-access-code.dto';

@Injectable()
export class PatientAccessCodeService {
  private readonly logger = new Logger(PatientAccessCodeService.name);
  private readonly EXPIRATION_MINUTES = 5;

  constructor(
    private readonly repository: PatientAccessCodeRepository,
    private readonly patientAccessCodeMapper: PatientAccessCodeMapper,
    private readonly patientService: PatientsService,
    private readonly qrCodeService: QrCodeService,
  ) {}

  public async getOrGenerate(
    userId: string,
    asQrCode: boolean,
  ): Promise<PatientAccessCodeDto> {
    const patientId = await this.patientService.findPatientIdByUserId(userId);

    let entity = await this.repository.findActiveByPatient(patientId);

    if (!entity || entity.isExpired()) {
      entity = await this.generate(patientId);
    }

    const response = this.patientAccessCodeMapper.toDto(entity);

    if (asQrCode) {
      const url = `${process.env.FRONTEND_URL}/patient-access/${entity.code}`;
      response.qrCode = await this.qrCodeService.generateBase64(url);
    }

    return response;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async deleteExpiredAccessCodes(): Promise<void> {
    this.logger.log('Iniciando limpeza de códigos de acesso expirados...');
    await this.repository.deleteExpiredUnused();
    this.logger.log('Limpeza de códigos expirados concluída.');
  }

  private async generate(patientId: string): Promise<PatientAccessCode> {
    let code = generateSixDigitCode();

    await until(
      async () => await this.repository.existsByCode(code),
      () => (code = generateSixDigitCode()),
    );

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.EXPIRATION_MINUTES);

    const entity = this.repository.create({
      code,
      patient: { id: patientId } as any,
      expiresAt,
      used: false,
    });

    return this.repository.save(entity);
  }
}
