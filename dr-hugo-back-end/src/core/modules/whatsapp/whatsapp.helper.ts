import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResolutionKeyService } from '../resolution-key/resolution-key.service';
import { WhatsAppTemplateEngine } from './whatsapp-template-engine.service';
import { ZApiService } from '../external/z-api/z-api.service';
import { WhatsAppReference } from './consts/whatsapp.consts';

@Injectable()
export class WhatsAppHelper {
  private readonly logger = new Logger(WhatsAppHelper.name);

  constructor(
    private readonly zApiService: ZApiService,
    private readonly configService: ConfigService,
    private readonly resolutionKeyService: ResolutionKeyService,
    private readonly templateEngine: WhatsAppTemplateEngine,
  ) {}

  public async sendPhoneChangeConfirmationRequest(
    newPhone: string,
    token: string,
    userId: string,
  ): Promise<void> {
    const encryptedParams = await this.createEncryptedQueryParam({
      userId,
      phone: newPhone,
      token,
      type: 'phone',
    });

    const confirmationUrl = `${this.configService.get(
      'web.baseUrl',
    )}${this.configService.get(
      'web.phoneChangeConfirmationPath',
    )}?t=${encryptedParams}`;

    const message = this.templateEngine.buildMessage(
      WhatsAppReference.PHONE_CHANGE_REQUEST,
      {
        confirmationUrl,
      },
    );

    const result = await this.zApiService.sendMessage({
      phone: newPhone,
      message,
      options: {
        ctas: [
          {
            type: 'URL',
            label: 'Confirmar alteração',
            url: confirmationUrl,
          },
        ],
      },
    });

    if (result.success) {
      this.logger.log(
        `[COMM] channel=whatsapp status=success recipient=${newPhone} template=PHONE_CHANGE_REQUEST messageId=${result.data?.messageId ?? 'n/a'}`,
      );
    } else {
      this.logger.error(
        `[COMM] channel=whatsapp status=failed recipient=${newPhone} template=PHONE_CHANGE_REQUEST error="${result.error?.message}" code=${result.error?.code ?? 'n/a'}`,
      );
    }
  }

  public async sendPhoneChangedWarning(
    oldPhone: string,
    newPhone: string,
  ): Promise<void> {
    const message = this.templateEngine.buildMessage(
      WhatsAppReference.PHONE_CHANGED_WARNING,
      {
        newPhone,
      },
    );

    const result = await this.zApiService.sendMessage({
      phone: oldPhone,
      message,
    });

    if (result.success) {
      this.logger.log(
        `[COMM] channel=whatsapp status=success recipient=${oldPhone} template=PHONE_CHANGED_WARNING messageId=${result.data?.messageId ?? 'n/a'}`,
      );
    } else {
      this.logger.error(
        `[COMM] channel=whatsapp status=failed recipient=${oldPhone} template=PHONE_CHANGED_WARNING error="${result.error?.message}" code=${result.error?.code ?? 'n/a'}`,
      );
    }
  }

  public async sendInstitutionAccessGranted(
    phone: string,
    data: {
      corporateName: string;
      cnes: string;
      cnpj: string;
      grantedAt: string;
    },
  ): Promise<void> {
    const accessUrl = `${this.configService.get('web.baseUrl')}/institutions`;

    const message = this.templateEngine.buildMessage(
      WhatsAppReference.INSTITUTION_ACCESS_GRANTED,
      {
        ...data,
        accessUrl,
      },
    );

    const institutionResult = await this.zApiService.sendMessage({
      phone,
      message,
      options: {
        ctas: [
          {
            type: 'URL',
            label: 'Gerenciar acesso',
            url: accessUrl,
          },
        ],
      },
    });

    if (institutionResult.success) {
      this.logger.log(
        `[COMM] channel=whatsapp status=success recipient=${phone} template=INSTITUTION_ACCESS_GRANTED messageId=${institutionResult.data?.messageId ?? 'n/a'}`,
      );
    } else {
      this.logger.error(
        `[COMM] channel=whatsapp status=failed recipient=${phone} template=INSTITUTION_ACCESS_GRANTED error="${institutionResult.error?.message}" code=${institutionResult.error?.code ?? 'n/a'}`,
      );
    }
  }

  public async sendDoctorAccessGranted(
    phone: string,
    data: {
      name: string;
      crm: string;
      crmUf: string;
      grantedAt: string;
    },
  ): Promise<void> {
    const accessUrl = `${this.configService.get('web.baseUrl')}/doctors`;

    const message = this.templateEngine.buildMessage(
      WhatsAppReference.DOCTOR_ACCESS_GRANTED,
      {
        ...data,
        accessUrl,
      },
    );

    const doctorResult = await this.zApiService.sendMessage({
      phone,
      message,
      options: {
        ctas: [
          {
            type: 'URL',
            label: 'Gerenciar acesso',
            url: accessUrl,
          },
        ],
      },
    });

    if (doctorResult.success) {
      this.logger.log(
        `[COMM] channel=whatsapp status=success recipient=${phone} template=DOCTOR_ACCESS_GRANTED messageId=${doctorResult.data?.messageId ?? 'n/a'}`,
      );
    } else {
      this.logger.error(
        `[COMM] channel=whatsapp status=failed recipient=${phone} template=DOCTOR_ACCESS_GRANTED error="${doctorResult.error?.message}" code=${doctorResult.error?.code ?? 'n/a'}`,
      );
    }
  }

  private async createEncryptedQueryParam(
    params: Record<string, string>,
  ): Promise<string> {
    const ttlSeconds = 24 * 60 * 60;
    return this.resolutionKeyService.create(params, ttlSeconds);
  }
}
