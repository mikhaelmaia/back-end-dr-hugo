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
    requestId: string,
  ): Promise<void> {
    const encryptedParams = await this.createEncryptedQueryParam({
      userId,
      phone: newPhone,
      token,
      requestId,
      type: 'phone',
    });

    const confirmationUrl = `${this.configService.get(
      'web.baseUrl',
    )}${this.configService.get(
      'web.profileChangeConfirmationPath',
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

  public async sendPatientDoctorGrantNotification(
    phone: string,
    data: {
      patientName: string;
      doctorName: string;
      grantedAt: Date;
      persistent: boolean;
      grantId: string;
    },
  ): Promise<void> {
    const baseUrl = this.configService.get<string>('web.baseUrl');
    const grantedDoctorPath = this.configService.get<string>(
      'web.grantedDoctorPath',
    );
    const doctorProfileUrl = `${baseUrl}${grantedDoctorPath}?grantId=${data.grantId}`;

    const message = this.templateEngine.buildMessage(
      WhatsAppReference.PATIENT_DOCTOR_GRANT,
      {
        patientName: data.patientName,
        doctorName: data.doctorName,
        grantedAt: this.formatDate(data.grantedAt),
        persistent: data.persistent,
        doctorProfileUrl,
      },
    );

    const template = data.persistent
      ? 'PATIENT_DOCTOR_GRANT_PERSISTENT'
      : 'PATIENT_DOCTOR_GRANT';

    const result = await this.zApiService.sendMessage({
      phone,
      message,
      options: {
        ctas: [
          {
            type: 'URL',
            label: 'Ver perfil do médico',
            url: doctorProfileUrl,
          },
          {
            type: 'URL',
            label: 'Revogar acesso',
            url: `${doctorProfileUrl}&revoke=true`,
          },
        ],
      },
    });

    if (result.success) {
      this.logger.log(
        `[COMM] channel=whatsapp status=success recipient=${phone} template=${template} messageId=${result.data?.messageId ?? 'n/a'}`,
      );
    } else {
      this.logger.error(
        `[COMM] channel=whatsapp status=failed recipient=${phone} template=${template} error="${result.error?.message}" code=${result.error?.code ?? 'n/a'}`,
      );
    }
  }

  public async sendPatientInstitutionGrantNotification(
    phone: string,
    data: {
      patientName: string;
      institutionName: string;
      grantedAt: Date;
      persistent: boolean;
      grantId: string;
    },
  ): Promise<void> {
    const baseUrl = this.configService.get<string>('web.baseUrl');
    const grantedInstitutionPath = this.configService.get<string>(
      'web.grantedInstitutionPath',
    );
    const institutionProfileUrl = `${baseUrl}${grantedInstitutionPath}?grantId=${data.grantId}`;

    const message = this.templateEngine.buildMessage(
      WhatsAppReference.PATIENT_INSTITUTION_GRANT,
      {
        patientName: data.patientName,
        institutionName: data.institutionName,
        grantedAt: this.formatDate(data.grantedAt),
        persistent: data.persistent,
        institutionProfileUrl,
      },
    );

    const template = data.persistent
      ? 'PATIENT_INSTITUTION_GRANT_PERSISTENT'
      : 'PATIENT_INSTITUTION_GRANT';

    const result = await this.zApiService.sendMessage({
      phone,
      message,
      options: {
        ctas: [
          {
            type: 'URL',
            label: 'Ver perfil da instituição',
            url: institutionProfileUrl,
          },
          {
            type: 'URL',
            label: 'Revogar acesso',
            url: `${institutionProfileUrl}&revoke=true`,
          },
        ],
      },
    });

    if (result.success) {
      this.logger.log(
        `[COMM] channel=whatsapp status=success recipient=${phone} template=${template} messageId=${result.data?.messageId ?? 'n/a'}`,
      );
    } else {
      this.logger.error(
        `[COMM] channel=whatsapp status=failed recipient=${phone} template=${template} error="${result.error?.message}" code=${result.error?.code ?? 'n/a'}`,
      );
    }
  }

  public async sendPatientDocumentUploadedNotification(
    phone: string,
    data: {
      patientName: string;
      institutionName: string;
      uploadedAt: Date;
      documentId: string;
    },
  ): Promise<void> {
    const baseUrl = this.configService.get<string>('web.baseUrl');
    const documentFormPath = this.configService.get<string>(
      'web.documentFormPath',
    );
    const documentUrl = `${baseUrl}${documentFormPath}?id=${data.documentId}`;

    const message = this.templateEngine.buildMessage(
      WhatsAppReference.PATIENT_DOCUMENT_UPLOADED,
      {
        patientName: data.patientName,
        institutionName: data.institutionName,
        uploadedAt: this.formatDate(data.uploadedAt),
        documentUrl,
      },
    );

    const result = await this.zApiService.sendMessage({
      phone,
      message,
      options: {
        ctas: [
          {
            type: 'URL',
            label: 'Ver documento',
            url: documentUrl,
          },
        ],
      },
    });

    if (result.success) {
      this.logger.log(
        `[COMM] channel=whatsapp status=success recipient=${phone} template=PATIENT_DOCUMENT_UPLOADED messageId=${result.data?.messageId ?? 'n/a'}`,
      );
    } else {
      this.logger.error(
        `[COMM] channel=whatsapp status=failed recipient=${phone} template=PATIENT_DOCUMENT_UPLOADED error="${result.error?.message}" code=${result.error?.code ?? 'n/a'}`,
      );
    }
  }

  public async sendDoctorReceivePatientGrantNotification(
    phone: string,
    data: {
      doctorName: string;
      patientName: string;
      grantedAt: Date;
      persistent: boolean;
      grantId: string;
    },
  ): Promise<void> {
    const baseUrl = this.configService.get<string>('web.baseUrl');
    const grantedPatientPath = this.configService.get<string>(
      'web.grantedPatientPath',
    );
    const patientProfileUrl = `${baseUrl}${grantedPatientPath}?grantId=${data.grantId}`;

    const message = this.templateEngine.buildMessage(
      WhatsAppReference.DOCTOR_RECEIVE_PATIENT_GRANT,
      {
        doctorName: data.doctorName,
        patientName: data.patientName,
        grantedAt: this.formatDate(data.grantedAt),
        persistent: data.persistent,
        patientProfileUrl,
      },
    );

    const template = data.persistent
      ? 'DOCTOR_RECEIVE_PATIENT_GRANT_PERSISTENT'
      : 'DOCTOR_RECEIVE_PATIENT_GRANT';

    const result = await this.zApiService.sendMessage({
      phone,
      message,
      options: {
        ctas: [
          {
            type: 'URL',
            label: 'Ver perfil do paciente',
            url: patientProfileUrl,
          },
          {
            type: 'URL',
            label: 'Revogar acesso',
            url: `${patientProfileUrl}&revoke=true`,
          },
        ],
      },
    });

    if (result.success) {
      this.logger.log(
        `[COMM] channel=whatsapp status=success recipient=${phone} template=${template} messageId=${result.data?.messageId ?? 'n/a'}`,
      );
    } else {
      this.logger.error(
        `[COMM] channel=whatsapp status=failed recipient=${phone} template=${template} error="${result.error?.message}" code=${result.error?.code ?? 'n/a'}`,
      );
    }
  }

  public async sendInstitutionReceivePatientGrantNotification(
    phone: string,
    data: {
      institutionName: string;
      patientName: string;
      grantedAt: Date;
      persistent: boolean;
      grantId: string;
    },
  ): Promise<void> {
    const baseUrl = this.configService.get<string>('web.baseUrl');
    const grantedPatientPath = this.configService.get<string>(
      'web.grantedPatientPath',
    );
    const patientProfileUrl = `${baseUrl}${grantedPatientPath}?grantId=${data.grantId}`;

    const message = this.templateEngine.buildMessage(
      WhatsAppReference.INSTITUTION_RECEIVE_PATIENT_GRANT,
      {
        institutionName: data.institutionName,
        patientName: data.patientName,
        grantedAt: this.formatDate(data.grantedAt),
        persistent: data.persistent,
        patientProfileUrl,
      },
    );

    const template = data.persistent
      ? 'INSTITUTION_RECEIVE_PATIENT_GRANT_PERSISTENT'
      : 'INSTITUTION_RECEIVE_PATIENT_GRANT';

    const result = await this.zApiService.sendMessage({
      phone,
      message,
      options: {
        ctas: [
          {
            type: 'URL',
            label: 'Ver perfil do paciente',
            url: patientProfileUrl,
          },
          {
            type: 'URL',
            label: 'Revogar acesso',
            url: `${patientProfileUrl}&revoke=true`,
          },
        ],
      },
    });

    if (result.success) {
      this.logger.log(
        `[COMM] channel=whatsapp status=success recipient=${phone} template=${template} messageId=${result.data?.messageId ?? 'n/a'}`,
      );
    } else {
      this.logger.error(
        `[COMM] channel=whatsapp status=failed recipient=${phone} template=${template} error="${result.error?.message}" code=${result.error?.code ?? 'n/a'}`,
      );
    }
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
